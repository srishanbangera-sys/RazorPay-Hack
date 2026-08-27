import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_audit_trail_retrieval_and_filtering():
    trace_id = "trace_audit_test_123"
    # Trigger an action to populate audit logs
    client.post(
        "/api/v1/checkout/propose",
        json={
            "mandate_id": "mandate_demo",
            "items": [{"product_id": "prod_001", "quantity": 1}],
            "trace_id": trace_id
        }
    )

    # Query audit events by trace_id
    response = client.get(f"/api/v1/audit?trace_id={trace_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 3
    event_types = [e["event_type"] for e in data["items"]]
    assert "CART_PROPOSED" in event_types
    assert "MANDATE_CHECK_STARTED" in event_types
    assert "MANDATE_APPROVED" in event_types

def test_explain_endpoint():
    trace_id = "trace_explain_test_456"
    prop_res = client.post(
        "/api/v1/checkout/propose",
        json={
            "mandate_id": "mandate_demo",
            "items": [{"product_id": "prod_002", "quantity": 1}],
            "trace_id": trace_id
        }
    )
    action_id = prop_res.json()["action_id"]

    explain_res = client.get(f"/api/v1/explain/{action_id}")
    assert explain_res.status_code == 200
    data = explain_res.json()
    assert data["decision"] == "rejected"
    assert data["code"] == "MANDATE_EXCEEDED"
    assert "exceeds the mandate" in data["explanation"]
