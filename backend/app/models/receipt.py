import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Receipt(Base):
    __tablename__ = "receipts"

    Receipt_ID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    File_path = Column(String(500), nullable=False)
    User_ID = Column(UUID(as_uuid=True), ForeignKey("users.User_ID"), nullable=False)
    Uploaded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="receipts")
    cost = relationship("Cost", back_populates="receipt", uselist=False)
