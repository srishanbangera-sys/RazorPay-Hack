from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.audit import AuditEvent
from app.schemas.explain import ExplainResponse

class ExplainService:
    @staticmethod
    def explain_action(db: Session, action_id: str) -> ExplainResponse:
        # Search for audit events related to this action or trace
        event = db.query(AuditEvent).filter(
            (AuditEvent.id == action_id) | 
            (AuditEvent.trace_id == action_id) |
            (AuditEvent.action.ilike(f"%{action_id}%"))
        ).order_by(AuditEvent.timestamp.desc()).first()

        if not event:
            # Check recent events JSON payloads in memory if DB JSON querying is limited
            recent_events = db.query(AuditEvent).order_by(AuditEvent.timestamp.desc()).limit(30).all()
            for e in recent_events:
                out_d = e.output_data or {}
                in_d = e.input_data or {}
                if out_d.get("action_id") == action_id or in_d.get("action_id") == action_id:
                    event = e
                    break

        if not event:
            # Fallback for direct lookup
            return ExplainResponse(
                action_id=action_id,
                decision="unknown",
                code="ACTION_NOT_FOUND",
                explanation="No recorded action or decision found with the given identifier.",
                details={}
            )

        # Generate human-readable explanation based on code and details
        code = event.reason_code or event.event_type
        details = event.output_data or {}
        decision = event.decision

        explanation = ""
        if code == "MANDATE_EXCEEDED":
            cart_total = details.get("cart_total", 0)
            max_amount = details.get("max_amount", 0)
            diff = details.get("difference", cart_total - max_amount)
            explanation = f"Checkout was blocked because the cart total of ₹{cart_total:,} exceeds the mandate spending limit of ₹{max_amount:,} by ₹{diff:,}."
        elif code == "CATEGORY_NOT_ALLOWED":
            cat = details.get("product_category", "unknown")
            allowed = ", ".join(details.get("allowed_categories", []))
            explanation = f"Checkout was blocked because product category '{cat}' is not in the allowed categories list [{allowed}]."
        elif code == "MAX_ITEMS_EXCEEDED":
            total_qty = details.get("total_quantity", 0)
            max_items = details.get("max_items_per_order", 0)
            explanation = f"Checkout was blocked because {total_qty} items were requested, exceeding the mandate limit of {max_items} item(s)."
        elif code == "OUT_OF_STOCK":
            pname = details.get("product_name", "Product")
            explanation = f"Checkout was blocked because '{pname}' is currently out of stock."
        elif code == "MANDATE_EXPIRED":
            expires_at = details.get("expires_at", "the past")
            explanation = f"Checkout was blocked because the mandate expired on {expires_at}."
        elif code == "MANDATE_INACTIVE":
            explanation = "Checkout was blocked because the active spending mandate has been deactivated."
        elif code == "MERCHANT_NOT_ALLOWED":
            req = details.get("requested_merchant", "unknown")
            allowed = details.get("allowed_merchant", "unknown")
            explanation = f"Checkout was blocked because merchant '{req}' is not authorized (allowed: '{allowed}')."
        elif code == "MANDATE_APPROVED":
            cart_total = details.get("cart_total", 0)
            max_amount = details.get("max_amount", 0)
            explanation = f"Checkout was approved. Cart total of ₹{cart_total:,} satisfies the mandate limit of ₹{max_amount:,}."
        else:
            explanation = f"Action resulted in decision '{decision}' with status code '{code}'."

        return ExplainResponse(
            action_id=action_id,
            decision=decision,
            code=code,
            explanation=explanation,
            details=details
        )
