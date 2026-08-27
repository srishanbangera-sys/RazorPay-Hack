from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Integer, JSON, DateTime
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Mandate(Base):
    __tablename__ = "mandates"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    merchant_id = Column(String(100), nullable=False, default="merchant_demo", index=True)
    max_amount = Column(Integer, nullable=False)
    allowed_categories = Column(JSON, nullable=False, default=list)  # list of strings
    max_items_per_order = Column(Integer, nullable=False, default=1)
    expires_at = Column(DateTime, nullable=False)
    status = Column(String(50), nullable=False, default="active", index=True)  # active / inactive
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
