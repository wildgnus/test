import uuid
from datetime import datetime, timedelta
from typing import Literal, Optional

import asyncpg
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5433/construction_db"
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None
    UPLOAD_DIR: str = "./uploads"

    class Config:
        env_file = ".env"


settings = Settings()
_pool: Optional[asyncpg.Pool] = None
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


class UserPublic(BaseModel):
    User_ID: uuid.UUID
    Email: str
    Role: Literal["manager", "builder"]
    Name: str
    Surname: str
    Created_at: datetime

    model_config = {"from_attributes": True}


async def create_pool() -> None:
    global _pool
    url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    _pool = await asyncpg.create_pool(url)


async def close_pool() -> None:
    if _pool:
        await _pool.close()


async def get_db():
    if _pool is None:
        raise RuntimeError("Database pool is not initialized")
    async with _pool.acquire() as conn:
        yield conn


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_db),
) -> UserPublic:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            raise unauthorized
        parsed_user_id = uuid.UUID(user_id)
    except (JWTError, ValueError):
        raise unauthorized

    row = await db.fetchrow(
        'SELECT "User_ID", "Email", "Role", "Name", "Surname", "Created_at" FROM "User" WHERE "User_ID" = $1',
        parsed_user_id,
    )
    if row is None:
        raise unauthorized

    return UserPublic.model_validate(dict(row))


async def require_manager(current_user: UserPublic = Depends(get_current_user)) -> UserPublic:
    if current_user.Role != "manager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers can perform this action",
        )
    return current_user
