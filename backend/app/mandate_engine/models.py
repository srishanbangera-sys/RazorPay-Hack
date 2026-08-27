from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class ProductData(BaseModel):
    id: str
    name: str
    price: int
    stock: int
    category: str
    attributes: Optional[Dict[str, Any]] = None

class CartItemData(BaseModel):
    product: ProductData
    quantity: int = Field(ge=1)

class MandateData(BaseModel):
    id: str
    merchant_id: str = "merchant_demo"
    max_amount: int
    allowed_categories: List[str]
    max_items_per_order: int
    expires_at: datetime
    status: str = "active"

class CheckoutAction(BaseModel):
    merchant_id: str = "merchant_demo"
    items: List[CartItemData]

class MandateDecision(BaseModel):
    allowed: bool
    code: str
    reason: str
    details: Dict[str, Any] = Field(default_factory=dict)
