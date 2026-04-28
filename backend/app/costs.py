import uuid
from datetime import date, datetime
from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.common import UserPublic, get_current_user, get_db, require_manager

router = APIRouter(prefix="/costs", tags=["costs"])

_COST_COLS = '"Cost_ID", "Project_ID", "Receipt_ID", "Amount", "Vendor_name", "Cost_date", "Category", "Created_at"'


class ItemResponse(BaseModel):
    Item_ID: uuid.UUID
    Cost_ID: uuid.UUID
    Name: Optional[str]
    Price: Optional[float]
    Quantity: Optional[float]
    Created_at: datetime


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
    Items: List[ItemResponse] = []


async def _get_costs_with_items(db, cost_rows: List) -> List[CostResponse]:
    """Fetch costs and their associated items."""
    costs = []
    for row in cost_rows:
        cost_dict = dict(row)
        cost_id = cost_dict["Cost_ID"]
        
        # Fetch items for this cost
        item_rows = await db.fetch(
            '''SELECT "Item_ID", "Cost_ID", "Name", "Price", "Quantity", "Created_at" 
               FROM "Item" WHERE "Cost_ID" = $1''',
            cost_id
        )
        
        items = [ItemResponse.model_validate(dict(ir)) for ir in item_rows]
        cost_dict["Items"] = items
        
        costs.append(CostResponse.model_validate(cost_dict))
    
    return costs


@router.get("", response_model=List[CostResponse])
async def get_all_costs(
    db=Depends(get_db),
    current_user: UserPublic = Depends(get_current_user),
):
    rows = await db.fetch(f'SELECT {_COST_COLS} FROM "Cost"')
    return await _get_costs_with_items(db, rows)


@router.get("/project/{project_id}", response_model=List[CostResponse])
async def get_project_costs(
    project_id: uuid.UUID,
    db=Depends(get_db),
    current_user: UserPublic = Depends(get_current_user),
):
    rows = await db.fetch(f'SELECT {_COST_COLS} FROM "Cost" WHERE "Project_ID" = $1', project_id)
    return await _get_costs_with_items(db, rows)


@router.delete("/{cost_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cost(
    cost_id: uuid.UUID,
    db=Depends(get_db),
    current_user: UserPublic = Depends(require_manager),
):
    result = await db.execute('DELETE FROM "Cost" WHERE "Cost_ID" = $1', cost_id)
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Cost not found")
