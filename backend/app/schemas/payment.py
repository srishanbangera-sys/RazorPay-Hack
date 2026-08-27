from typing import Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class PaymentVerifyRequest(BaseModel):
    order_id: str
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
    trace_id: Optional[str] = None

class PaymentVerifyResponse(BaseModel):
    success: bool
    status: str
    message: str
    order_id: str
    payment_id: Optional[str] = None
    trace_id: str

class PaymentWebhookPayload(BaseModel):
    event: str
    payload: Dict[str, Any]
