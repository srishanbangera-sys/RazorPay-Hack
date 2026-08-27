from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Order(Base):
    __tablename__ = "orders"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    mandate_id = Column(String(64), ForeignKey("mandates.id"), nullable=True)
    merchant_id = Column(String(100), nullable=False, default="merchant_demo")
    amount = Column(Integer, nullable=False)  # Server calculated
    status = Column(String(50), nullable=False, default="proposed", index=True)
    # Statuses: proposed / approved / payment_pending / paid / failed / rejected
    razorpay_order_id = Column(String(100), nullable=True, index=True)
    trace_id = Column(String(100), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    mandate = relationship("Mandate")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    order_id = Column(String(64), ForeignKey("orders.id"), nullable=False, index=True)
    product_id = Column(String(64), ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Integer, nullable=False)  # Server price at purchase time

    order = relationship("Order", back_populates="items")
    product = relationship("Product")
