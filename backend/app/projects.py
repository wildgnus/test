import uuid
from datetime import date, datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.common import UserPublic, get_current_user, get_db, require_manager

router = APIRouter(prefix="/projects", tags=["projects"])

_PROJECT_COLS = '"Project_ID", "Name", "Description", "Budget", "Deadline", "Created_by", "Created_at"'

_FIELD_MAP = {
    "name": "Name",
    "description": "Description",
    "budget": "Budget",
    "deadline": "Deadline",
}


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    budget: float
    deadline: date


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    budget: Optional[float] = None
    deadline: Optional[date] = None


class ProjectResponse(BaseModel):
    Project_ID: uuid.UUID
    Name: str
    Description: Optional[str]
    Budget: float
    Deadline: date
    Created_by: uuid.UUID
    Created_at: datetime


class AssignUserRequest(BaseModel):
    user_id: uuid.UUID


@router.get("", response_model=List[ProjectResponse])
async def get_projects(
    db=Depends(get_db),
    current_user: UserPublic = Depends(get_current_user),
):
    if current_user.Role == "manager":
        rows = await db.fetch(f'SELECT {_PROJECT_COLS} FROM "Project"')
    else:
        rows = await db.fetch(
            f'''
            SELECT p."Project_ID", p."Name", p."Description", p."Budget", p."Deadline", p."Created_by", p."Created_at"
            FROM "Project" p
            JOIN "ProjectUser" pu ON p."Project_ID" = pu."Project_ID"
            WHERE pu."User_ID" = $1
            ''',
            current_user.User_ID,
        )
    return [dict(row) for row in rows]


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    db=Depends(get_db),
    current_user: UserPublic = Depends(require_manager),
):
    row = await db.fetchrow(
        f'''
        INSERT INTO "Project" ("Name", "Description", "Budget", "Deadline", "Created_by")
        VALUES ($1, $2, $3, $4, $5)
        RETURNING {_PROJECT_COLS}
        ''',
        project_data.name,
        project_data.description,
        project_data.budget,
        project_data.deadline,
        current_user.User_ID,
    )
    return dict(row)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: uuid.UUID,
    db=Depends(get_db),
    current_user: UserPublic = Depends(get_current_user),
):
    row = await db.fetchrow(f'SELECT {_PROJECT_COLS} FROM "Project" WHERE "Project_ID" = $1', project_id)
    if not row:
        raise HTTPException(status_code=404, detail="Project not found")
    return dict(row)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: uuid.UUID,
    project_data: ProjectUpdate,
    db=Depends(get_db),
    current_user: UserPublic = Depends(require_manager),
):
    updates = project_data.model_dump(exclude_none=True)
    if not updates:
        row = await db.fetchrow(f'SELECT {_PROJECT_COLS} FROM "Project" WHERE "Project_ID" = $1', project_id)
        if not row:
            raise HTTPException(status_code=404, detail="Project not found")
        return dict(row)

    set_parts = []
    values = []
    for index, (field_name, field_value) in enumerate(updates.items(), start=1):
        set_parts.append(f'"{_FIELD_MAP[field_name]}" = ${index}')
        values.append(field_value)
    values.append(project_id)

    row = await db.fetchrow(
        f'UPDATE "Project" SET {", ".join(set_parts)} WHERE "Project_ID" = ${len(values)} RETURNING {_PROJECT_COLS}',
        *values,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Project not found")
    return dict(row)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: uuid.UUID,
    db=Depends(get_db),
    current_user: UserPublic = Depends(require_manager),
):
    result = await db.execute('DELETE FROM "Project" WHERE "Project_ID" = $1', project_id)
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Project not found")


@router.post("/{project_id}/assign")
async def assign_user_to_project(
    project_id: uuid.UUID,
    body: AssignUserRequest,
    db=Depends(get_db),
    current_user: UserPublic = Depends(require_manager),
):
    if not await db.fetchrow('SELECT 1 FROM "Project" WHERE "Project_ID" = $1', project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    if not await db.fetchrow('SELECT 1 FROM "User" WHERE "User_ID" = $1', body.user_id):
        raise HTTPException(status_code=404, detail="User not found")

    if await db.fetchrow(
        'SELECT 1 FROM "ProjectUser" WHERE "Project_ID" = $1 AND "User_ID" = $2',
        project_id,
        body.user_id,
    ):
        raise HTTPException(status_code=400, detail="User already assigned to project")

    await db.execute(
        'INSERT INTO "ProjectUser" ("Project_ID", "User_ID") VALUES ($1, $2)',
        project_id,
        body.user_id,
    )
    return {"message": "User assigned successfully"}


@router.get("/{project_id}/users", response_model=List[UserPublic])
async def get_project_users(
    project_id: uuid.UUID,
    db=Depends(get_db),
    current_user: UserPublic = Depends(get_current_user),
):
    rows = await db.fetch(
        '''
        SELECT u."User_ID", u."Email", u."Role", u."Name", u."Surname", u."Created_at"
        FROM "User" u
        JOIN "ProjectUser" pu ON u."User_ID" = pu."User_ID"
        WHERE pu."Project_ID" = $1
        ''',
        project_id,
    )
    return [dict(row) for row in rows]
