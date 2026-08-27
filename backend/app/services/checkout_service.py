import uuid
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.product import Product
from app.models.mandate import Mandate
from app.models.order import Order, OrderItem
from app.schemas.checkout import (
    CheckoutItemInput,
    CheckoutProposeRequest,
    CheckoutProposeResponse,
    CheckoutConfirmRequest,
    CheckoutConfirmResponse,
    CartItemDetail,
    RazorpayOrderDetails
)
from app.schemas.product import ProductResponse
from app.mandate_engine.models import (
    ProductData,
    CartItemData,
    MandateData,
    CheckoutAction,
    MandateDecision
)
from app.mandate_engine.engine import evaluate_mandate
from app.services.audit_service import AuditService
from app.services.mandate_service import MandateService
from app.services.payment_service import PaymentService

class CheckoutService:
    @staticmethod
    def _fetch_cart_data(
        db: Session,
        items: List[CheckoutItemInput]
    ) -> Tuple[List[CartItemData], List[CartItemDetail], int, int]:
        """
        Authoritatively fetch products from the database and compute totals on the server.
        Never trusts client-provided prices or totals.
        """
        engine_items: List[CartItemData] = []
        schema_items: List[CartItemDetail] = []
        cart_total = 0
        total_quantity = 0

        for item_in in items:
            product = db.query(Product).filter(Product.id == item_in.product_id).first()
            if not product:
                raise HTTPException(
                    status_code=404,
                    detail={
                        "code": "PRODUCT_NOT_FOUND",
                        "message": f"Product with ID '{item_in.product_id}' does not exist in catalog."
                    }
                )
            
            p_data = ProductData(
                id=product.id,
                name=product.name,
                price=product.price,
                stock=product.stock,
                category=product.category,
                attributes=product.attributes or {}
            )
            
            subtotal = product.price * item_in.quantity
            cart_total += subtotal
            total_quantity += item_in.quantity

            engine_items.append(CartItemData(product=p_data, quantity=item_in.quantity))
            schema_items.append(
                CartItemDetail(
                    product=ProductResponse.model_validate(product),
                    quantity=item_in.quantity,
                    unit_price=product.price,
                    subtotal=subtotal
                )
            )

        return engine_items, schema_items, cart_total, total_quantity

    @staticmethod
    def propose_checkout(
        db: Session,
        request: CheckoutProposeRequest
    ) -> CheckoutProposeResponse:
        trace_id = request.trace_id or f"trace_{uuid.uuid4().hex[:10]}"
        action_id = f"act_{uuid.uuid4().hex[:10]}"

        mandate = db.query(Mandate).filter(Mandate.id == request.mandate_id).first()
        if not mandate:
            raise HTTPException(
                status_code=404,
                detail={"code": "MANDATE_NOT_FOUND", "message": f"Mandate '{request.mandate_id}' not found."}
            )

        engine_items, schema_items, cart_total, total_quantity = CheckoutService._fetch_cart_data(db, request.items)

        # Audit: Cart proposed
        AuditService.log_event(
            db=db,
            trace_id=trace_id,
            actor="agent",
            event_type="CART_PROPOSED",
            action="Propose Shopping Cart",
            decision="info",
            input_data={"mandate_id": mandate.id, "items": [i.model_dump() for i in request.items]},
            output_data={
                "cart_total": cart_total,
                "total_quantity": total_quantity,
                "action_id": action_id
            }
        )

        # Audit: Mandate evaluation started
        AuditService.log_event(
            db=db,
            trace_id=trace_id,
            actor="backend",
            event_type="MANDATE_CHECK_STARTED",
            action="Evaluate Mandate Rules",
            decision="info",
            input_data={"mandate_id": mandate.id, "cart_total": cart_total, "max_amount": mandate.max_amount}
        )

        # Pure Mandate Engine Evaluation
        action = CheckoutAction(merchant_id=mandate.merchant_id, items=engine_items)
        mandate_data = MandateService.to_engine_data(mandate)
        decision: MandateDecision = evaluate_mandate(action, mandate_data)

        # Audit: Mandate Result
        event_type = "MANDATE_APPROVED" if decision.allowed else "MANDATE_REJECTED"
        actor = "mandate_engine"
        output_event_data = {**decision.details, "action_id": action_id}
        AuditService.log_event(
            db=db,
            trace_id=trace_id,
            actor=actor,
            event_type=event_type,
            action=f"Mandate Decision: {action_id}",
            decision="approved" if decision.allowed else "rejected",
            reason_code=decision.code,
            input_data={"cart_total": cart_total, "mandate_id": mandate.id, "action_id": action_id},
            output_data=output_event_data
        )

        return CheckoutProposeResponse(
            allowed=decision.allowed,
            decision_code=decision.code,
            message=decision.reason,
            cart_total=cart_total,
            total_items=total_quantity,
            items=schema_items,
            details=decision.details,
            trace_id=trace_id,
            action_id=action_id
        )

    @staticmethod
    def confirm_checkout(
        db: Session,
        request: CheckoutConfirmRequest
    ) -> CheckoutConfirmResponse:
        trace_id = request.trace_id or f"trace_{uuid.uuid4().hex[:10]}"

        mandate = db.query(Mandate).filter(Mandate.id == request.mandate_id).first()
        if not mandate:
            raise HTTPException(
                status_code=404,
                detail={"code": "MANDATE_NOT_FOUND", "message": f"Mandate '{request.mandate_id}' not found."}
            )

        # NON-NEGOTIABLE SECURITY REQUIREMENT:
        # Re-fetch authoritative product data and RE-EVALUATE the mandate immediately before creating order/payment.
        engine_items, schema_items, cart_total, total_quantity = CheckoutService._fetch_cart_data(db, request.items)
        action = CheckoutAction(merchant_id=mandate.merchant_id, items=engine_items)
        mandate_data = MandateService.to_engine_data(mandate)
        decision: MandateDecision = evaluate_mandate(action, mandate_data)

        if not decision.allowed:
            # Mandate check failed: NEVER call payment creation or create an approved order.
            AuditService.log_event(
                db=db,
                trace_id=trace_id,
                actor="mandate_engine",
                event_type="MANDATE_REJECTED",
                action="Confirm Checkout Blocked",
                decision="rejected",
                reason_code=decision.code,
                input_data={"cart_total": cart_total, "mandate_id": mandate.id},
                output_data=decision.details
            )
            return CheckoutConfirmResponse(
                success=False,
                allowed=False,
                decision_code=decision.code,
                message=decision.reason,
                cart_total=cart_total,
                details=decision.details,
                trace_id=trace_id
            )

        # Mandate passed: Create local Order & OrderItems
        order = Order(
            id=f"order_{uuid.uuid4().hex[:12]}",
            mandate_id=mandate.id,
            merchant_id=mandate.merchant_id,
            amount=cart_total,
            status="approved",
            trace_id=trace_id
        )
        db.add(order)
        db.flush()

        for item_detail in schema_items:
            order_item = OrderItem(
                id=f"item_{uuid.uuid4().hex[:12]}",
                order_id=order.id,
                product_id=item_detail.product.id,
                quantity=item_detail.quantity,
                unit_price=item_detail.unit_price
            )
            db.add(order_item)

        db.commit()
        db.refresh(order)

        # Log Order Created
        AuditService.log_event(
            db=db,
            trace_id=trace_id,
            actor="backend",
            event_type="ORDER_CREATED",
            action="Create Local Merchant Order",
            decision="approved",
            reason_code="ORDER_CREATED",
            input_data={"cart_total": cart_total, "mandate_id": mandate.id},
            output_data={"order_id": order.id, "status": order.status},
            order_id=order.id
        )

        # Initiate Razorpay test mode order
        rzp_data = PaymentService.create_order(db=db, local_order=order, trace_id=trace_id)

        return CheckoutConfirmResponse(
            success=True,
            allowed=True,
            decision_code="MANDATE_APPROVED",
            message="Checkout approved and order initiated.",
            order_id=order.id,
            cart_total=cart_total,
            razorpay_order=RazorpayOrderDetails(**rzp_data),
            details=decision.details,
            trace_id=trace_id
        )
