import uuid
from typing import List

from fastapi import APIRouter, Depends

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.cost import CostResponse
from app.schemas.user import UserResponse

router = APIRouter(prefix="/costs", tags=["costs"])

_COST_COLS = '"Cost_ID", "Project_ID", "Receipt_ID", "Amount", "Vendor_name", "Cost_date", "Category", "Created_at"'


@router.get("", response_model=List[CostResponse])
async def get_all_costs(
    db=Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    rows = await db.fetch(f"SELECT {_COST_COLS} FROM \"Cost\"")
    return [dict(r) for r in rows]


@router.get("/project/{project_id}", response_model=List[CostResponse])
async def get_project_costs(
    project_id: uuid.UUID,
    db=Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    rows = await db.fetch(f'SELECT {_COST_COLS} FROM "Cost" WHERE "Project_ID" = $1', project_id)
    return [dict(r) for r in rows]
