import asyncpg
from app.core.config import settings

_pool: asyncpg.Pool = None


async def create_pool() -> None:
    global _pool
    url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    _pool = await asyncpg.create_pool(url)


async def close_pool() -> None:
    if _pool:
        await _pool.close()


async def get_db():
    async with _pool.acquire() as conn:
        yield conn
