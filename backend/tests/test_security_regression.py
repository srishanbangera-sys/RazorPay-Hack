import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.services.payment_service import PaymentService
from app.core.database import SessionLocal
from app.models.audit import AuditEvent
from app.models.order import Order

client = TestClient(app)

def test_critical_security_rejection_blocks_payment_creation():
    """
    CRITICAL REGRESSION TEST:
    Proves that when a checkout violates the mandate (e.g. ₹1799 Premium Runner under ₹1500 mandate),
    the backend physically halts execution:
    1. HTTP response indicates rejection with MANDATE_EXCEEDED
    2. PaymentService.create_order is NEVER called
    3. No approved order is persisted in the database
    4. An append-only audit event records MANDATE_REJECTED with exact difference
    """
    with patch.object(PaymentService, "create_order", wraps=PaymentService.create_order) as mock_rzp_create:
        trace_id = "trace_security_test_001"
        response = client.post(
            "/api/v1/checkout/confirm",
            json={
                "mandate_id": "mandate_demo",
                "items": [{"product_id": "prod_002", "quantity": 1}],  # Premium Runner ₹1799
                "trace_id": trace_id
            }
        )

        # 1. Verify structured response
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["allowed"] is False
        assert data["decision_code"] == "MANDATE_EXCEEDED"
        assert data["cart_total"] == 1799
        assert data["order_id"] is None
        assert data["razorpay_order"] is None

        # 2. Verify Payment order creation was NEVER called
        mock_rzp_create.assert_not_called()

        # 3. Verify no approved order was created with this trace
        db = SessionLocal()
        try:
            created_order = db.query(Order).filter(Order.trace_id == trace_id).first()
            assert created_order is None

            # 4. Verify append-only audit rejection event exists
            rejection_event = db.query(AuditEvent).filter(
                AuditEvent.trace_id == trace_id,
                AuditEvent.event_type == "MANDATE_REJECTED"
            ).first()
            assert rejection_event is not None
            assert rejection_event.reason_code == "MANDATE_EXCEEDED"
            assert rejection_event.output_data["difference"] == 299
        finally:
            db.close()
