import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_checkout_propose_approved():
    response = client.post(
        "/api/v1/checkout/propose",
        json={
            "mandate_id": "mandate_demo",
            "items": [{"product_id": "prod_001", "quantity": 1}]
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["allowed"] is True
    assert data["decision_code"] == "MANDATE_APPROVED"
    assert data["cart_total"] == 1299
    assert "trace_id" in data
    assert "action_id" in data

def test_checkout_propose_rejected_over_amount():
    response = client.post(
        "/api/v1/checkout/propose",
        json={
            "mandate_id": "mandate_demo",
            "items": [{"product_id": "prod_002", "quantity": 1}]
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["allowed"] is False
    assert data["decision_code"] == "MANDATE_EXCEEDED"
    assert data["cart_total"] == 1799
    assert data["details"]["difference"] == 299

def test_checkout_confirm_success():
    response = client.post(
        "/api/v1/checkout/confirm",
        json={
            "mandate_id": "mandate_demo",
            "items": [{"product_id": "prod_001", "quantity": 1}]
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["allowed"] is True
    assert data["order_id"] is not None
    assert data["razorpay_order"] is not None
    assert data["razorpay_order"]["amount"] == 129900  # 1299 * 100 paise

def test_checkout_confirm_rejected():
    response = client.post(
        "/api/v1/checkout/confirm",
        json={
            "mandate_id": "mandate_demo",
            "items": [{"product_id": "prod_002", "quantity": 1}]
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["allowed"] is False
    assert data["decision_code"] == "MANDATE_EXCEEDED"
    assert data["order_id"] is None
    assert data["razorpay_order"] is None
