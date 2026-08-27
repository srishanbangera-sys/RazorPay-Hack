from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Integer, Text, JSON, DateTime
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Product(Base):
    __tablename__ = "products"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Integer, nullable=False)  # In INR (e.g. 1299)
    stock = Column(Integer, nullable=False, default=0)
    category = Column(String(100), nullable=False, index=True)
    attributes = Column(JSON, nullable=True, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
