import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class ProjectUser(Base):
    __tablename__ = "project_users"

    ProjectUser_ID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    Project_ID = Column(UUID(as_uuid=True), ForeignKey("projects.Project_ID"), nullable=False)
    User_ID = Column(UUID(as_uuid=True), ForeignKey("users.User_ID"), nullable=False)
    Assigned_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="project_assignments")
