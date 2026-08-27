from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from app.schemas.product import ProductResponse

class CheckoutItemInput(BaseModel):
    product_id: str
    quantity: int = Field(default=1, ge=1)

class CheckoutProposeRequest(BaseModel):
    mandate_id: str
    items: List[CheckoutItemInput]
    trace_id: Optional[str] = None

class CartItemDetail(BaseModel):
    product: ProductResponse
    quantity: int
    unit_price: int
    subtotal: int

class CheckoutProposeResponse(BaseModel):
    allowed: bool
    decision_code: str
    message: str
    cart_total: int
    total_items: int
    items: List[CartItemDetail] = Field(default_factory=list)
    details: Dict[str, Any] = Field(default_factory=dict)
    trace_id: str
    action_id: str

class CheckoutConfirmRequest(BaseModel):
    mandate_id: str
    items: List[CheckoutItemInput]
    trace_id: Optional[str] = None
    action_id: Optional[str] = None

class RazorpayOrderDetails(BaseModel):
    order_id: str
    amount: int  # in paise
    currency: str = "INR"
    key_id: Optional[str] = None
    merchant_name: str
    is_mock: bool = False

class CheckoutConfirmResponse(BaseModel):
    success: bool
    allowed: bool
    decision_code: str
    message: str
    order_id: Optional[str] = None
    cart_total: int
    razorpay_order: Optional[RazorpayOrderDetails] = None
    details: Dict[str, Any] = Field(default_factory=dict)
    trace_id: str
