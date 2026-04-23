import os
import uuid
from typing import List, Optional

import aiofiles
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user, require_manager
from app.schemas.task import TaskCreate, TaskResponse, TaskStatusUpdate, TaskUpdate
from app.schemas.user import UserResponse

router = APIRouter(prefix="/tasks", tags=["tasks"])

_TASK_COLS = '"Task_ID", "Project_ID", "Title", "Description", "User_ID", "Status", "Priority", "Deadline", "Photo_path", "Created_at"'

_FIELD_MAP = {
    "title": "Title",
    "description": "Description",
    "user_id": "User_ID",
    "status": "Status",
    "priority": "Priority",
    "deadline": "Deadline",
}


@router.get("", response_model=List[TaskResponse])
async def get_tasks(
    project_id: Optional[uuid.UUID] = Query(default=None),
    task_status: Optional[str] = Query(default=None, alias="status"),
    priority: Optional[str] = Query(default=None),
    db=Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    conditions = []
    values = []

    if current_user.Role == "builder":
        conditions.append(f'"User_ID" = ${len(values) + 1}')
        values.append(current_user.User_ID)
    if project_id:
        conditions.append(f'"Project_ID" = ${len(values) + 1}')
        values.append(project_id)
    if task_status:
        conditions.append(f'"Status" = ${len(values) + 1}')
        values.append(task_status)
    if priority:
        conditions.append(f'"Priority" = ${len(values) + 1}')
        values.append(priority)

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    rows = await db.fetch(f"SELECT {_TASK_COLS} FROM \"Task\" {where}", *values)
    return [dict(r) for r in rows]


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    db=Depends(get_db),
    current_user: UserResponse = Depends(require_manager),
):
    row = await db.fetchrow(
        f"""
        INSERT INTO "Task" ("Project_ID", "Title", "Description", "User_ID", "Status", "Priority", "Deadline")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING {_TASK_COLS}
        """,
        task_data.project_id,
        task_data.title,
        task_data.description,
        task_data.user_id,
        task_data.status,
        task_data.priority,
        task_data.deadline,
    )
    return dict(row)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: uuid.UUID,
    db=Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    row = await db.fetchrow(f'SELECT {_TASK_COLS} FROM "Task" WHERE "Task_ID" = $1', task_id)
    if not row:
        raise HTTPException(status_code=404, detail="Task not found")
    return dict(row)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: uuid.UUID,
    task_data: TaskUpdate,
    db=Depends(get_db),
    current_user: UserResponse = Depends(require_manager),
):
    updates = task_data.model_dump(exclude_none=True)
    if not updates:
        row = await db.fetchrow(f'SELECT {_TASK_COLS} FROM "Task" WHERE "Task_ID" = $1', task_id)
        if not row:
            raise HTTPException(status_code=404, detail="Task not found")
        return dict(row)

    set_parts = []
    values = []
    for i, (key, value) in enumerate(updates.items(), start=1):
        set_parts.append(f'"{_FIELD_MAP[key]}" = ${i}')
        values.append(value)
    values.append(task_id)

    row = await db.fetchrow(
        f'UPDATE "Task" SET {", ".join(set_parts)} WHERE "Task_ID" = ${len(values)} RETURNING {_TASK_COLS}',
        *values,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Task not found")
    return dict(row)


@router.patch("/{task_id}/status", response_model=TaskResponse)
async def update_task_status(
    task_id: uuid.UUID,
    status_data: TaskStatusUpdate,
    db=Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    row = await db.fetchrow(f'SELECT {_TASK_COLS} FROM "Task" WHERE "Task_ID" = $1', task_id)
    if not row:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.Role == "builder" and row["User_ID"] != current_user.User_ID:
        raise HTTPException(status_code=403, detail="Cannot update another user's task")

    row = await db.fetchrow(
        f'UPDATE "Task" SET "Status" = $1 WHERE "Task_ID" = $2 RETURNING {_TASK_COLS}',
        status_data.status,
        task_id,
    )
    return dict(row)


@router.post("/{task_id}/photo", response_model=TaskResponse)
async def upload_task_photo(
    task_id: uuid.UUID,
    file: UploadFile = File(...),
    db=Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    row = await db.fetchrow(f'SELECT {_TASK_COLS} FROM "Task" WHERE "Task_ID" = $1', task_id)
    if not row:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.Role == "builder" and row["User_ID"] != current_user.User_ID:
        raise HTTPException(status_code=403, detail="Access denied")

    photo_dir = os.path.join(settings.UPLOAD_DIR, "tasks")
    os.makedirs(photo_dir, exist_ok=True)

    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    file_name = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(photo_dir, file_name)

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(await file.read())

    row = await db.fetchrow(
        f'UPDATE "Task" SET "Photo_path" = $1 WHERE "Task_ID" = $2 RETURNING {_TASK_COLS}',
        file_path,
        task_id,
    )
    return dict(row)
