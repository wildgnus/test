import os
import uuid
from datetime import date, datetime

import aiofiles
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.receipt import ReceiptResponse, ReceiptUploadResponse
from app.schemas.user import UserResponse
from app.services.ocr_service import process_receipt

router = APIRouter(prefix="/receipts", tags=["receipts"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".pdf"}


@router.post("/upload", response_model=ReceiptUploadResponse)
async def upload_receipt(
    file: UploadFile = File(...),
    project_id: uuid.UUID = Form(...),
    category: str = Form(default="other"),
    db=Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
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

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(await file.read())

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
            cost_date = date.today()
            if extracted_data.get("cost_date"):
                try:
                    cost_date = datetime.fromisoformat(extracted_data["cost_date"]).date()
                except (ValueError, TypeError):
                    pass

            cost_row = await db.fetchrow(
                """
                INSERT INTO "Cost" ("Project_ID", "Receipt_ID", "Amount", "Vendor_name", "Cost_date", "Category")
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING "Cost_ID"
                """,
                project_id,
                receipt_row["Receipt_ID"],
                extracted_data["amount"],
                extracted_data.get("vendor_name"),
                cost_date,
                category,
            )
            cost_id = cost_row["Cost_ID"]
            cost_created = True

    return ReceiptUploadResponse(
        receipt=ReceiptResponse.model_validate(dict(receipt_row)),
        extracted_data=extracted_data,
        cost_created=cost_created,
        cost_id=cost_id,
    )
