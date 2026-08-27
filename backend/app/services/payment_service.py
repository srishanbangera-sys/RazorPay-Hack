import hmac
import hashlib
import uuid
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
import razorpay

from app.core.config import settings
from app.models.payment import Payment
from app.models.order import Order
from app.services.audit_service import AuditService

class PaymentService:
    @staticmethod
    def is_real_razorpay_configured() -> bool:
        return bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET)

    @staticmethod
    def create_order(
        db: Session,
        local_order: Order,
        trace_id: str
    ) -> Dict[str, Any]:
        """
        Creates a Razorpay Test Mode order.
        CRITICAL: This function must only be called AFTER successful mandate validation.
        """
        amount_paise = local_order.amount * 100  # Razorpay amounts are in paise

        if PaymentService.is_real_razorpay_configured():
            try:
                client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
                data = {
                    "amount": amount_paise,
                    "currency": "INR",
                    "receipt": local_order.id,
                    "notes": {
                        "trace_id": trace_id,
                        "mandate_id": local_order.mandate_id
                    }
                }
                rzp_order = client.order.create(data=data)
                rzp_order_id = rzp_order["id"]
                is_mock = False
            except Exception as e:
                # Log failure
                AuditService.log_event(
                    db=db,
                    trace_id=trace_id,
                    actor="payment",
                    event_type="PAYMENT_FAILED",
                    action="Create Razorpay Order",
                    decision="rejected",
                    reason_code="RAZORPAY_API_ERROR",
                    input_data={"order_id": local_order.id, "amount": local_order.amount},
                    output_data={"error": str(e)},
                    order_id=local_order.id
                )
                raise
        else:
            # Clean Mock/Demo Adapter for zero-dependency local testing
            rzp_order_id = f"order_demo_{uuid.uuid4().hex[:12]}"
            is_mock = True

        # Update local order with external razorpay order id
        local_order.razorpay_order_id = rzp_order_id
        local_order.status = "payment_pending"
        db.commit()
        db.refresh(local_order)

        # Create Payment Record in 'created' state
        payment = Payment(
            id=f"pay_{uuid.uuid4().hex[:12]}",
            order_id=local_order.id,
            provider="razorpay" if not is_mock else "mock_razorpay",
            provider_order_id=rzp_order_id,
            amount=local_order.amount,
            status="created",
            raw_reference={"is_mock": is_mock, "amount_paise": amount_paise}
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)

        # Append Audit Event
        AuditService.log_event(
            db=db,
            trace_id=trace_id,
            actor="backend",
            event_type="RAZORPAY_ORDER_CREATED",
            action="Create Razorpay Order in Test Mode",
            decision="approved",
            reason_code="RAZORPAY_ORDER_SUCCESS",
            input_data={"order_id": local_order.id, "amount_paise": amount_paise},
            output_data={
                "razorpay_order_id": rzp_order_id,
                "is_mock": is_mock,
                "currency": "INR"
            },
            order_id=local_order.id,
            payment_id=payment.id
        )

        return {
            "order_id": rzp_order_id,
            "amount": amount_paise,
            "currency": "INR",
            "key_id": settings.RAZORPAY_KEY_ID or "rzp_test_demo_key",
            "merchant_name": settings.MERCHANT_NAME,
            "is_mock": is_mock
        }

    @staticmethod
    def verify_payment(
        db: Session,
        order_id: str,
        razorpay_payment_id: str,
        razorpay_order_id: str,
        razorpay_signature: str,
        trace_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Verify payment signature and update order/payment state.
        """
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            return {"success": False, "status": "failed", "message": "Order not found."}

        effective_trace_id = trace_id or order.trace_id

        # Verification check
        verified = False
        if PaymentService.is_real_razorpay_configured():
            try:
                client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
                params_dict = {
                    "razorpay_order_id": razorpay_order_id,
                    "razorpay_payment_id": razorpay_payment_id,
                    "razorpay_signature": razorpay_signature
                }
                client.utility.verify_payment_signature(params_dict)
                verified = True
            except Exception:
                verified = False
        else:
            # Mock verification
            verified = bool(razorpay_payment_id and razorpay_order_id)

        payment = db.query(Payment).filter(Payment.order_id == order.id).order_by(Payment.created_at.desc()).first()

        if verified:
            order.status = "paid"
            if payment:
                payment.status = "captured"
                payment.provider_payment_id = razorpay_payment_id
                payment.raw_reference = {
                    **(payment.raw_reference or {}),
                    "signature": razorpay_signature,
                    "verified": True
                }
            db.commit()

            AuditService.log_event(
                db=db,
                trace_id=effective_trace_id,
                actor="payment",
                event_type="PAYMENT_SUCCEEDED",
                action="Process Razorpay Payment",
                decision="approved",
                reason_code="PAYMENT_CAPTURED",
                input_data={
                    "order_id": order.id,
                    "razorpay_order_id": razorpay_order_id,
                    "razorpay_payment_id": razorpay_payment_id
                },
                output_data={"order_status": "paid"},
                order_id=order.id,
                payment_id=payment.id if payment else None
            )

            return {
                "success": True,
                "status": "paid",
                "message": "Payment verified and order captured successfully.",
                "order_id": order.id,
                "payment_id": payment.id if payment else None,
                "trace_id": effective_trace_id
            }
        else:
            order.status = "failed"
            if payment:
                payment.status = "failed"
            db.commit()

            AuditService.log_event(
                db=db,
                trace_id=effective_trace_id,
                actor="payment",
                event_type="PAYMENT_FAILED",
                action="Verify Payment Signature",
                decision="rejected",
                reason_code="INVALID_SIGNATURE",
                input_data={"order_id": order.id, "razorpay_payment_id": razorpay_payment_id},
                output_data={"error": "Signature mismatch"},
                order_id=order.id,
                payment_id=payment.id if payment else None
            )

            return {
                "success": False,
                "status": "failed",
                "message": "Payment verification failed.",
                "order_id": order.id,
                "payment_id": payment.id if payment else None,
                "trace_id": effective_trace_id
            }
