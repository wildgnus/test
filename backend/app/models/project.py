import uuid
from datetime import datetime

from sqlalchemy import Column, Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Project(Base):
    __tablename__ = "projects"

    Project_ID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    Name = Column(String(255), nullable=False)
    Description = Column(Text, nullable=True)
    Budget = Column(Numeric(10, 2), nullable=False)
    Deadline = Column(Date, nullable=False)
    Created_by = Column(UUID(as_uuid=True), ForeignKey("users.User_ID"), nullable=False)
    Created_at = Column(DateTime, default=datetime.utcnow)

    creator = relationship(
        "User", back_populates="created_projects", foreign_keys=[Created_by]
    )
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    costs = relationship("Cost", back_populates="project", cascade="all, delete-orphan")
    members = relationship(
        "ProjectUser", back_populates="project", cascade="all, delete-orphan"
    )
