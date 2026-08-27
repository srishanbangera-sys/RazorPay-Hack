from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, JSON, DateTime, ForeignKey
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    trace_id = Column(String(100), nullable=False, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    actor = Column(String(50), nullable=False)  # buyer / agent / backend / mandate_engine / payment
    event_type = Column(String(50), nullable=False, index=True)
    action = Column(String(255), nullable=False)
    decision = Column(String(50), nullable=False)  # approved / rejected / info
    reason_code = Column(String(100), nullable=True, index=True)
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    order_id = Column(String(64), ForeignKey("orders.id"), nullable=True, index=True)
    payment_id = Column(String(64), ForeignKey("payments.id"), nullable=True, index=True)
