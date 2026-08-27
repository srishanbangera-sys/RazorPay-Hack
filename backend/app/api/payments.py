from fastapi import APIRouter, Depends, Request, Header, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.payment import PaymentVerifyRequest, PaymentVerifyResponse
from app.services.payment_service import PaymentService
from app.services.audit_service import AuditService

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/verify", response_model=PaymentVerifyResponse)
def verify_payment(
    request: PaymentVerifyRequest,
    db: Session = Depends(get_db)
):
    """
    Verifies Razorpay payment signature and marks order as paid.
    """
    result = PaymentService.verify_payment(
        db=db,
        order_id=request.order_id,
        razorpay_payment_id=request.razorpay_payment_id,
        razorpay_order_id=request.razorpay_order_id,
        razorpay_signature=request.razorpay_signature,
        trace_id=request.trace_id
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result)
    return PaymentVerifyResponse(**result)

@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(None),
    db: Session = Depends(get_db)
):
    """
    Idempotent webhook handler for Razorpay test events.
    """
    payload = await request.json()
    event_name = payload.get("event", "unknown")
    
    # Log webhook event
    AuditService.log_event(
        db=db,
        trace_id="webhook_event",
        actor="payment",
        event_type="PAYMENT_WEBHOOK_RECEIVED",
        action=f"Webhook: {event_name}",
        decision="info",
        input_data={"event": event_name}
    )
    
    return {"status": "ok", "processed": True}
