import uuid
from datetime import datetime

from sqlalchemy import Column, Date, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Task(Base):
    __tablename__ = "tasks"

    Task_ID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    Project_ID = Column(UUID(as_uuid=True), ForeignKey("projects.Project_ID"), nullable=False)
    Title = Column(String(255), nullable=False)
    Description = Column(Text, nullable=True)
    User_ID = Column(UUID(as_uuid=True), ForeignKey("users.User_ID"), nullable=True)
    Status = Column(String(50), nullable=False, default="pending")
    Priority = Column(String(50), nullable=False, default="medium")
    Deadline = Column(Date, nullable=True)
    Photo_path = Column(String(500), nullable=True)
    Created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="tasks")
    assigned_user = relationship("User", back_populates="assigned_tasks")
