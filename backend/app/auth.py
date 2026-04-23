import uuid
from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, field_validator

from app.common import create_access_token, get_db, get_password_hash, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    surname: str
    role: Literal["manager", "builder"] = "builder"

    @field_validator("password")
    @classmethod
    def password_min_length(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters")
        return value


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    User_ID: uuid.UUID
    Email: str
    Role: str
    Name: str
    Surname: str
    Created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db=Depends(get_db)):
    existing = await db.fetchrow('SELECT "User_ID" FROM "User" WHERE "Email" = $1', user_data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    row = await db.fetchrow(
        '''
        INSERT INTO "User" ("Email", "Password", "Name", "Surname", "Role")
        VALUES ($1, $2, $3, $4, $5)
        RETURNING "User_ID", "Email", "Role", "Name", "Surname", "Created_at"
        ''',
        user_data.email,
        get_password_hash(user_data.password),
        user_data.name,
        user_data.surname,
        user_data.role,
    )
    return UserResponse.model_validate(dict(row))


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db=Depends(get_db)):
    row = await db.fetchrow(
        'SELECT "User_ID", "Email", "Password", "Role", "Name", "Surname", "Created_at" FROM "User" WHERE "Email" = $1',
        credentials.email,
    )

    if not row or not verify_password(credentials.password, row["Password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(data={"sub": str(row["User_ID"])})
    user_payload = {
        "User_ID": row["User_ID"],
        "Email": row["Email"],
        "Role": row["Role"],
        "Name": row["Name"],
        "Surname": row["Surname"],
        "Created_at": row["Created_at"],
    }
    return Token(access_token=token, token_type="bearer", user=UserResponse.model_validate(user_payload))
