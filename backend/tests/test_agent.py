import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_agent_scenario_1_success_flow():
    response = client.post(
        "/api/v1/agent/chat",
        json={
            "message": "Find me running shoes under ₹1500",
            "mandate_id": "mandate_demo",
            "conversation_id": "conv_test_success"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "Sprint Runner" in data["message"] or data["cart_total"] == 1299
    assert data["cart_total"] == 1299
    assert data["mandate_decision"]["decision_code"] == "MANDATE_APPROVED"
    assert data["order_id"] is not None

    tool_names = [t["tool"] for t in data["tools_invoked"]]
    assert "search_catalog" in tool_names
    assert "propose_cart" in tool_names
    assert "checkout" in tool_names
    # Verify Revenue Growth upsell recommendation within remaining budget
    assert "Smart Revenue Growth Recommendation" in data["message"]
    assert "Anti-Blister Running Socks" in data["message"]

def test_agent_scenario_2_graceful_failure_flow():
    response = client.post(
        "/api/v1/agent/chat",
        json={
            "message": "Buy the premium running shoes",
            "mandate_id": "mandate_demo",
            "conversation_id": "conv_test_failure"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["cart_total"] == 1799
    assert data["mandate_decision"]["decision_code"] == "MANDATE_EXCEEDED"
    assert data["mandate_decision"]["allowed"] is False
    assert data["order_id"] is None
    assert data["alternative_product"] is not None
    assert data["alternative_product"]["price"] <= 1500

    tool_names = [t["tool"] for t in data["tools_invoked"]]
    assert "search_catalog" in tool_names
    assert "propose_cart" in tool_names
    assert "checkout" in tool_names
    assert "explain_last_action" in tool_names
    assert "find_alternatives" in tool_names
