import uuid
from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel


class TaskCreate(BaseModel):
    project_id: uuid.UUID
    title: str
    description: Optional[str] = None
    user_id: Optional[uuid.UUID] = None
    status: Literal["pending", "in_progress", "completed"] = "pending"
    priority: Literal["low", "medium", "high"] = "medium"
    deadline: Optional[date] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    user_id: Optional[uuid.UUID] = None
    status: Optional[Literal["pending", "in_progress", "completed"]] = None
    priority: Optional[Literal["low", "medium", "high"]] = None
    deadline: Optional[date] = None


class TaskStatusUpdate(BaseModel):
    status: Literal["pending", "in_progress", "completed"]


class TaskResponse(BaseModel):
    Task_ID: uuid.UUID
    Project_ID: uuid.UUID
    Title: str
    Description: Optional[str]
    User_ID: Optional[uuid.UUID]
    Status: str
    Priority: str
    Deadline: Optional[date]
    Photo_path: Optional[str]
    Created_at: datetime

    model_config = {"from_attributes": True}
