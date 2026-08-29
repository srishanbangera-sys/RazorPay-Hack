from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Integer, Float, Text, JSON, DateTime
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Product(Base):
    __tablename__ = "products"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False, index=True)
    brand = Column(String(100), nullable=True, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, index=True)
    product_type = Column(String(100), nullable=True, index=True)
    price = Column(Integer, nullable=False)  # In INR (e.g. 1299)
    cost_price = Column(Integer, nullable=True)
    stock = Column(Integer, nullable=False, default=0)
    rating = Column(Float, nullable=True, default=0.0)
    sales_count = Column(Integer, nullable=True, default=0)
    views = Column(Integer, nullable=True, default=0)
    conversion_rate = Column(Float, nullable=True, default=0.0)
    color = Column(String(100), nullable=True)
    sizes_or_capacity = Column(String(255), nullable=True)
    specification = Column(String(255), nullable=True)
    profit_per_unit = Column(Integer, nullable=True)
    estimated_revenue = Column(Integer, nullable=True)
    estimated_profit = Column(Integer, nullable=True)
    stock_status = Column(String(50), nullable=True, default="in_stock")
    attributes = Column(JSON, nullable=True, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
