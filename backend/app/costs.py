import uuid
from datetime import date, datetime
from typing import List, Literal, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.common import UserPublic, get_current_user, get_db

router = APIRouter(prefix="/costs", tags=["costs"])

_COST_COLS = '"Cost_ID", "Project_ID", "Receipt_ID", "Amount", "Vendor_name", "Cost_date", "Category", "Created_at"'


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


@router.get("", response_model=List[CostResponse])
async def get_all_costs(
    db=Depends(get_db),
    current_user: UserPublic = Depends(get_current_user),
):
    rows = await db.fetch(f'SELECT {_COST_COLS} FROM "Cost"')
    return [dict(row) for row in rows]


@router.get("/project/{project_id}", response_model=List[CostResponse])
async def get_project_costs(
    project_id: uuid.UUID,
    db=Depends(get_db),
    current_user: UserPublic = Depends(get_current_user),
):
    rows = await db.fetch(f'SELECT {_COST_COLS} FROM "Cost" WHERE "Project_ID" = $1', project_id)
    return [dict(row) for row in rows]
