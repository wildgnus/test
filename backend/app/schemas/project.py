import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


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

    model_config = {"from_attributes": True}


class AssignUserRequest(BaseModel):
    user_id: uuid.UUID
