import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app import auth, costs, projects, receipts, tasks, users
from app.common import close_pool, create_pool, settings

app = FastAPI(
    title="Construction Management Platform",
    description="AI-powered construction project management with receipt OCR",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(costs.router)
app.include_router(receipts.router)


@app.on_event("startup")
async def startup() -> None:
    await create_pool()


@app.on_event("shutdown")
async def shutdown() -> None:
    await close_pool()


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
