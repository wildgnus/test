from fastapi import APIRouter, Depends, HTTPException, status

from app.core.database import get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from app.schemas.user import Token, UserCreate, UserLogin, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db=Depends(get_db)):
    existing = await db.fetchrow('SELECT "User_ID" FROM "User" WHERE "Email" = $1', user_data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    row = await db.fetchrow(
        """
        INSERT INTO "User" ("Email", "Password", "Name", "Surname", "Role")
        VALUES ($1, $2, $3, $4, $5)
        RETURNING "User_ID", "Email", "Role", "Name", "Surname", "Created_at"
        """,
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

    access_token = create_access_token(data={"sub": str(row["User_ID"])})
    user = UserResponse.model_validate(dict(row))
    return Token(access_token=access_token, token_type="bearer", user=user)
