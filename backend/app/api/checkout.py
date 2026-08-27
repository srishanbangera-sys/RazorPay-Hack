from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.checkout import (
    CheckoutProposeRequest,
    CheckoutProposeResponse,
    CheckoutConfirmRequest,
    CheckoutConfirmResponse
)
from app.services.checkout_service import CheckoutService

router = APIRouter(prefix="/checkout", tags=["Checkout"])

@router.post("/propose", response_model=CheckoutProposeResponse)
def propose_checkout(
    request: CheckoutProposeRequest,
    db: Session = Depends(get_db)
):
    """
    Proposes a cart, authoritatively calculates prices on the server,
    evaluates the mandate, and logs audit events.
    """
    return CheckoutService.propose_checkout(db=db, request=request)

@router.post("/confirm", response_model=CheckoutConfirmResponse)
def confirm_checkout(
    request: CheckoutConfirmRequest,
    db: Session = Depends(get_db)
):
    """
    Re-evaluates the mandate immediately before order and payment creation.
    Blocked mandates will never reach Razorpay order creation.
    """
    return CheckoutService.confirm_checkout(db=db, request=request)
