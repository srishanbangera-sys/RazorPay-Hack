from datetime import datetime, timezone
from typing import Optional
from app.mandate_engine.models import CheckoutAction, MandateData, MandateDecision

def check_active_status(mandate: MandateData) -> Optional[MandateDecision]:
    """Rule 1: Mandate must be active."""
    if mandate.status.lower() != "active":
        return MandateDecision(
            allowed=False,
            code="MANDATE_INACTIVE",
            reason="The spending mandate is inactive.",
            details={
                "mandate_id": mandate.id,
                "status": mandate.status
            }
        )
    return None

def check_expiry(mandate: MandateData, current_time: Optional[datetime] = None) -> Optional[MandateDecision]:
    """Rule 2: Mandate must not be expired."""
    now = current_time or datetime.now(timezone.utc)
    # Normalize timezone for comparison if necessary
    expires_at = mandate.expires_at
    if expires_at.tzinfo is None and now.tzinfo is not None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    elif expires_at.tzinfo is not None and now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)

    if now > expires_at:
        return MandateDecision(
            allowed=False,
            code="MANDATE_EXPIRED",
            reason=f"The mandate expired on {mandate.expires_at.isoformat()}.",
            details={
                "mandate_id": mandate.id,
                "expires_at": mandate.expires_at.isoformat(),
                "current_time": now.isoformat()
            }
        )
    return None

def check_merchant(action: CheckoutAction, mandate: MandateData) -> Optional[MandateDecision]:
    """Rule 3: Merchant must match."""
    if action.merchant_id != mandate.merchant_id:
        return MandateDecision(
            allowed=False,
            code="MERCHANT_NOT_ALLOWED",
            reason=f"Merchant '{action.merchant_id}' is not authorized for this mandate.",
            details={
                "requested_merchant": action.merchant_id,
                "allowed_merchant": mandate.merchant_id
            }
        )
    return None

def check_stock(action: CheckoutAction) -> Optional[MandateDecision]:
    """Rule 4: All products must be in stock."""
    for item in action.items:
        if item.product.stock < item.quantity:
            return MandateDecision(
                allowed=False,
                code="OUT_OF_STOCK",
                reason=f"Product '{item.product.name}' has insufficient stock (Requested: {item.quantity}, Available: {item.product.stock}).",
                details={
                    "product_id": item.product.id,
                    "product_name": item.product.name,
                    "requested_quantity": item.quantity,
                    "available_stock": item.product.stock
                }
            )
    return None

def check_categories(action: CheckoutAction, mandate: MandateData) -> Optional[MandateDecision]:
    """Rule 5: All product categories must belong to allowed_categories."""
    allowed = {cat.strip().lower() for cat in mandate.allowed_categories}
    for item in action.items:
        product_cat = item.product.category.strip().lower()
        if product_cat not in allowed:
            return MandateDecision(
                allowed=False,
                code="CATEGORY_NOT_ALLOWED",
                reason=f"Category '{item.product.category}' for product '{item.product.name}' is not permitted by mandate.",
                details={
                    "product_id": item.product.id,
                    "product_name": item.product.name,
                    "product_category": item.product.category,
                    "allowed_categories": mandate.allowed_categories
                }
            )
    return None

def check_item_count(action: CheckoutAction, mandate: MandateData) -> Optional[MandateDecision]:
    """Rule 6: Total item quantity must not exceed max_items_per_order."""
    total_quantity = sum(item.quantity for item in action.items)
    if total_quantity > mandate.max_items_per_order:
        return MandateDecision(
            allowed=False,
            code="MAX_ITEMS_EXCEEDED",
            reason=f"Order quantity of {total_quantity} items exceeds the mandate maximum of {mandate.max_items_per_order}.",
            details={
                "total_quantity": total_quantity,
                "max_items_per_order": mandate.max_items_per_order,
                "excess": total_quantity - mandate.max_items_per_order
            }
        )
    return None

def check_spending_limit(action: CheckoutAction, mandate: MandateData) -> Optional[MandateDecision]:
    """Rule 7: Server-calculated cart total must not exceed max_amount."""
    cart_total = sum(item.product.price * item.quantity for item in action.items)
    if cart_total > mandate.max_amount:
        diff = cart_total - mandate.max_amount
        return MandateDecision(
            allowed=False,
            code="MANDATE_EXCEEDED",
            reason=f"Cart total of ₹{cart_total:,} exceeds the maximum permitted mandate amount of ₹{mandate.max_amount:,} by ₹{diff:,}.",
            details={
                "cart_total": cart_total,
                "max_amount": mandate.max_amount,
                "difference": diff
            }
        )
    return None
