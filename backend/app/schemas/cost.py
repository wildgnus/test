import uuid
from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel


class CostCreate(BaseModel):
    project_id: uuid.UUID
    receipt_id: Optional[uuid.UUID] = None
    amount: float
    vendor_name: Optional[str] = None
    cost_date: date
    category: Literal["materials", "labor", "equipment", "other"] = "other"


class CostResponse(BaseModel):
    Cost_ID: uuid.UUID
    Project_ID: uuid.UUID
    Receipt_ID: Optional[uuid.UUID]
    Amount: float
    Vendor_name: Optional[str]
    Cost_date: date
    Category: str
    Created_at: datetime

    model_config = {"from_attributes": True}
