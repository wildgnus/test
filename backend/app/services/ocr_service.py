import os
import re
from datetime import date, datetime
from typing import Any, Dict, Optional

from app.core.config import settings


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
    for pattern, fmt in patterns:
        match = re.search(pattern, text)
        if match:
            g = match.groups()
            try:
                if fmt == "ymd":
                    return date(int(g[0]), int(g[1]), int(g[2]))
                year = int(g[2]) + (2000 if int(g[2]) < 100 else 0)
                return date(year, int(g[1]), int(g[0]))
            except (ValueError, TypeError):
                continue
    return date.today()


async def process_receipt(file_path: str) -> Dict[str, Any]:
    result: Dict[str, Any] = {
        "amount": None,
        "vendor_name": None,
        "cost_date": date.today().isoformat(),
        "raw_text": "",
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
        with open(file_path, "rb") as f:
            content = f.read()

        image = vision.Image(content=content)
        response = client.text_detection(image=image)

        if response.error.message:
            result["raw_text"] = f"Vision API error: {response.error.message}"
            return result

        if response.text_annotations:
            full_text = response.text_annotations[0].description
            result["raw_text"] = full_text
            result["amount"] = _parse_amount(full_text)
            result["vendor_name"] = _parse_vendor(full_text)
            result["cost_date"] = _parse_date(full_text).isoformat()
            result["success"] = True

    except ImportError:
        result["raw_text"] = "google-cloud-vision package not installed"
    except Exception as e:
        result["raw_text"] = f"OCR processing error: {str(e)}"

    return result
