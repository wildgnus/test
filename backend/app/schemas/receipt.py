import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel


class ReceiptResponse(BaseModel):
    Receipt_ID: uuid.UUID
    File_path: str
    User_ID: uuid.UUID
    Uploaded_at: datetime

    model_config = {"from_attributes": True}


class ReceiptUploadResponse(BaseModel):
    receipt: ReceiptResponse
    extracted_data: Dict[str, Any]
    cost_created: bool
    cost_id: Optional[uuid.UUID] = None
