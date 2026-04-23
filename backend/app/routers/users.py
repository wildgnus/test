from typing import List

from fastapi import APIRouter, Depends

from app.core.database import get_db
from app.core.security import get_current_user, require_manager
from app.schemas.user import UserResponse

router = APIRouter(prefix="/users", tags=["users"])

_USER_COLS = '"User_ID", "Email", "Role", "Name", "Surname", "Created_at"'


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user


@router.get("", response_model=List[UserResponse])
async def get_users(
    db=Depends(get_db),
    current_user: UserResponse = Depends(require_manager),
):
    rows = await db.fetch(f"SELECT {_USER_COLS} FROM \"User\"")
    return [dict(r) for r in rows]
