import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    User_ID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    Email = Column(String(255), unique=True, nullable=False, index=True)
    Password = Column(String(255), nullable=False)
    Role = Column(String(50), nullable=False, default="builder")
    Name = Column(String(100), nullable=False)
    Surname = Column(String(100), nullable=False)
    Created_at = Column(DateTime, default=datetime.utcnow)

    created_projects = relationship(
        "Project", back_populates="creator", foreign_keys="Project.Created_by"
    )
    assigned_tasks = relationship("Task", back_populates="assigned_user")
    receipts = relationship("Receipt", back_populates="user")
    project_assignments = relationship("ProjectUser", back_populates="user")
