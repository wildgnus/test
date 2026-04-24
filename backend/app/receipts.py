import os
import re
import uuid
from datetime import date, datetime
from typing import Any, Dict, Optional

import aiofiles
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from app.common import UserPublic, get_current_user, get_db, settings

router = APIRouter(prefix="/receipts", tags=["receipts"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".pdf"}


class ReceiptResponse(BaseModel):
    Receipt_ID: uuid.UUID
    File_path: str
    User_ID: uuid.UUID
    Uploaded_at: datetime


class ReceiptUploadResponse(BaseModel):
    receipt: ReceiptResponse
    extracted_data: Dict[str, Any]
    cost_created: bool
    cost_id: Optional[uuid.UUID] = None


def _parse_amount(text: str) -> Optional[float]:
    patterns = [
        r"(?:total|amount|sum)[:\s]*\$?\s*(\d{1,6}[.,]\d{2})",
        r"\$\s*(\d{1,6}[.,]\d{2})",
        r"(\d{1,6}[.,]\d{2})",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                return float(match.group(1).replace(",", "."))
            except ValueError:
                continue
    return None


def _parse_vendor(text: str) -> Optional[str]:
    for line in text.strip().split("\n")[:4]:
        line = line.strip()
        if line and len(line) > 2 and not re.match(r"^\d", line):
            return line[:255]
    return None


def _parse_date(text: str) -> date:
    patterns = [
        (r"(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})", "ymd"),
        (r"(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})", "dmy"),
    ]
    for pattern, kind in patterns:
        match = re.search(pattern, text)
        if match:
            g = match.groups()
            try:
                if kind == "ymd":
                    return date(int(g[0]), int(g[1]), int(g[2]))
                year = int(g[2]) + (2000 if int(g[2]) < 100 else 0)
                return date(year, int(g[1]), int(g[0]))
            except (TypeError, ValueError):
                continue
    return date.today()


def _parse_items(text: str) -> list[Dict[str, Any]]:
    """Extract line items from receipt text.
    
    Looks for patterns like:
    - Item Name    5.99
    - Description  x2  10.99
    - Product      qty: 3  price: 15.50
    """
    items = []
    lines = text.strip().split("\n")
    
    for line in lines:
        line = line.strip()
        if not line or len(line) < 3:
            continue
            
        # Skip common non-item lines
        if any(skip in line.lower() for skip in ["total", "subtotal", "tax", "paid", "thank", "receipt", "date", "time"]):
            continue
        
        # Pattern 1: "Item Name  $12.99" or "Item Name  12.99  x2"
        # Look for price patterns at end of line
        price_match = re.search(r'(?:^|[\s]+)(\d{1,6}[.,]\d{2})(?:\s*$|\s+(?:x|qty|qty:)?[\s]*(\d+(?:[.,]\d+)?)?)', line)
        
        if price_match:
            price_str = price_match.group(1).replace(",", ".")
            qty_str = price_match.group(2)
            quantity = 1.0
            
            try:
                price = float(price_str)
                if qty_str:
                    quantity = float(qty_str.replace(",", "."))
                
                # Extract item name (everything before the price)
                item_name = line[:price_match.start()].strip()
                if item_name and len(item_name) > 1:
                    items.append({
                        "name": item_name[:255],
                        "price": price,
                        "quantity": quantity,
                    })
            except ValueError:
                continue
    
    return items


async def process_receipt(file_path: str) -> Dict[str, Any]:
    result: Dict[str, Any] = {
        "amount": None,
        "vendor_name": None,
        "cost_date": date.today().isoformat(),
        "raw_text": "",
        "items": [],
        "success": False,
    }

    creds = settings.GOOGLE_APPLICATION_CREDENTIALS
    if not creds or not os.path.exists(creds):
        result["raw_text"] = "Google Vision API credentials not configured"
        return result

    try:
        from google.cloud import vision

        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = creds

        client = vision.ImageAnnotatorClient()
        with open(file_path, "rb") as stream:
            content = stream.read()

        image = vision.Image(content=content)
        response = client.text_detection(image=image)

        if response.error.message:
            result["raw_text"] = f'Vision API error: {response.error.message}'
            return result

        if response.text_annotations:
            full_text = response.text_annotations[0].description
            result["raw_text"] = full_text
            result["amount"] = _parse_amount(full_text)
            result["vendor_name"] = _parse_vendor(full_text)
            result["cost_date"] = _parse_date(full_text).isoformat()
            result["items"] = _parse_items(full_text)
            result["success"] = True

    except ImportError:
        result["raw_text"] = "google-cloud-vision package not installed"
    except Exception as exc:
        result["raw_text"] = f'OCR processing error: {str(exc)}'

    return result


@router.post("/upload", response_model=ReceiptUploadResponse)
async def upload_receipt(
    file: UploadFile = File(...),
    project_id: uuid.UUID = Form(...),
    category: str = Form(default="other"),
    db=Depends(get_db),
    current_user: UserPublic = Depends(get_current_user),
):
    if not await db.fetchrow('SELECT 1 FROM "Project" WHERE "Project_ID" = $1', project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ".jpg"
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="File type not supported")

    upload_dir = os.path.join(settings.UPLOAD_DIR, "receipts")
    os.makedirs(upload_dir, exist_ok=True)

    file_name = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(upload_dir, file_name)

    async with aiofiles.open(file_path, "wb") as stream:
        await stream.write(await file.read())

    extracted_data = await process_receipt(file_path)

    cost_id = None
    cost_created = False

    async with db.transaction():
        receipt_row = await db.fetchrow(
            'INSERT INTO "Receipt" ("File_path", "User_ID") VALUES ($1, $2) RETURNING "Receipt_ID", "File_path", "User_ID", "Uploaded_at"',
            file_path,
            current_user.User_ID,
        )

        if extracted_data.get("amount"):
            parsed_date = date.today()
            if extracted_data.get("cost_date"):
                try:
                    parsed_date = datetime.fromisoformat(extracted_data["cost_date"]).date()
                except (TypeError, ValueError):
                    pass

            cost_row = await db.fetchrow(
                '''
                INSERT INTO "Cost" ("Project_ID", "Receipt_ID", "Amount", "Vendor_name", "Cost_date", "Category")
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING "Cost_ID"
                ''',
                project_id,
                receipt_row["Receipt_ID"],
                extracted_data["amount"],
                extracted_data.get("vendor_name"),
                parsed_date,
                category,
            )
            cost_id = cost_row["Cost_ID"]
            cost_created = True
            
            # Insert line items from receipt
            if extracted_data.get("items"):
                for item in extracted_data["items"]:
                    await db.execute(
                        '''
                        INSERT INTO "Item" ("Cost_ID", "Name", "Price", "Quantity")
                        VALUES ($1, $2, $3, $4)
                        ''',
                        cost_id,
                        item.get("name"),
                        item.get("price"),
                        item.get("quantity"),
                    )

    return ReceiptUploadResponse(
        receipt=ReceiptResponse.model_validate(dict(receipt_row)),
        extracted_data=extracted_data,
        cost_created=cost_created,
        cost_id=cost_id,
    )
