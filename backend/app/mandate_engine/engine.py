from datetime import datetime
from typing import Optional
from app.mandate_engine.models import CheckoutAction, MandateData, MandateDecision
from app.mandate_engine.rules import (
    check_active_status,
    check_expiry,
    check_merchant,
    check_stock,
    check_categories,
    check_item_count,
    check_spending_limit
)

def evaluate_mandate(
    action: CheckoutAction,
    mandate: MandateData,
    current_time: Optional[datetime] = None
) -> MandateDecision:
    """
    Pure, isolated, deterministic Mandate Engine evaluation.
    Evaluates business rules in strict priority order.
    Returns structured decision object.
    """
    # 1. Active status check
    if failure := check_active_status(mandate):
        return failure

    # 2. Expiry check
    if failure := check_expiry(mandate, current_time):
        return failure

    # 3. Merchant match check
    if failure := check_merchant(action, mandate):
        return failure

    # 4. Stock availability check
    if failure := check_stock(action):
        return failure

    # 5. Category restriction check
    if failure := check_categories(action, mandate):
        return failure

    # 6. Maximum items per order check
    if failure := check_item_count(action, mandate):
        return failure

    # 7. Spending limit check
    if failure := check_spending_limit(action, mandate):
        return failure

    # All rules satisfied
    cart_total = sum(item.product.price * item.quantity for item in action.items)
    total_quantity = sum(item.quantity for item in action.items)
    
    return MandateDecision(
        allowed=True,
        code="MANDATE_APPROVED",
        reason="The checkout satisfies all mandate constraints.",
        details={
            "mandate_id": mandate.id,
            "cart_total": cart_total,
            "max_amount": mandate.max_amount,
            "total_items": total_quantity,
            "max_items_per_order": mandate.max_items_per_order,
            "allowed_categories": mandate.allowed_categories
        }
    )
