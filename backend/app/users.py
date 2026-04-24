from typing import List

from fastapi import APIRouter, Depends

from app.common import UserPublic, get_current_user, get_db, require_manager

router = APIRouter(prefix="/users", tags=["users"])

_USER_COLS = '"User_ID", "Email", "Role", "Name", "Surname", "Created_at"'


@router.get("/me", response_model=UserPublic)
async def get_me(current_user: UserPublic = Depends(get_current_user)):
    return current_user


@router.get("", response_model=List[UserPublic])
async def get_users(
    db=Depends(get_db),
    current_user: UserPublic = Depends(require_manager),
):
    rows = await db.fetch(f'SELECT {_USER_COLS} FROM "User"')
    return [dict(row) for row in rows]
