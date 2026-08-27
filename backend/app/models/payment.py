from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Integer, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    order_id = Column(String(64), ForeignKey("orders.id"), nullable=False, index=True)
    provider = Column(String(50), nullable=False, default="razorpay")
    provider_payment_id = Column(String(100), nullable=True, index=True)
    provider_order_id = Column(String(100), nullable=True, index=True)
    amount = Column(Integer, nullable=False)
    status = Column(String(50), nullable=False, default="created")  # created / authorized / captured / failed
    raw_reference = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    order = relationship("Order")
