import uuid
from datetime import datetime

from sqlalchemy import Column, Date, DateTime, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Cost(Base):
    __tablename__ = "costs"

    Cost_ID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    Project_ID = Column(UUID(as_uuid=True), ForeignKey("projects.Project_ID"), nullable=False)
    Receipt_ID = Column(UUID(as_uuid=True), ForeignKey("receipts.Receipt_ID"), nullable=True)
    Amount = Column(Numeric(10, 2), nullable=False)
    Vendor_name = Column(String(255), nullable=True)
    Cost_date = Column(Date, nullable=False)
    Category = Column(String(100), nullable=False, default="other")
    Created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="costs")
    receipt = relationship("Receipt", back_populates="cost")
