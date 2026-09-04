from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone

router = APIRouter(prefix="/newsletter", tags=["Newsletter"])

# In-memory storage for demo subscriptions
SUBSCRIBERS = []

class NewsletterSubscribeRequest(BaseModel):
    email: str

class NewsletterSubscribeResponse(BaseModel):
    status: str
    message: str
    coupon_code: str
    discount_percent: int
    subscribed_at: str

@router.post("/subscribe", response_model=NewsletterSubscribeResponse)
def subscribe_newsletter(request: NewsletterSubscribeRequest):
    email = request.email.strip().lower()
    if not email or "@" not in email or "." not in email:
        raise HTTPException(status_code=400, detail="Please provide a valid email address.")
    
    if email not in [s["email"] for s in SUBSCRIBERS]:
        SUBSCRIBERS.append({
            "email": email,
            "subscribed_at": datetime.now(timezone.utc).isoformat()
        })
        
    return NewsletterSubscribeResponse(
        status="success",
        message="Thank you for subscribing to Jenier News! Enjoy 10% off your order.",
        coupon_code="JENIER10",
        discount_percent=10,
        subscribed_at=datetime.now(timezone.utc).isoformat()
    )
