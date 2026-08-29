import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_products_list():
    response = client.get("/api/v1/products")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) >= 10
    names = [p["name"] for p in data["items"]]
    assert "Sprint Runner" in names
    assert "Premium Runner" in names

def test_filter_by_category():
    response = client.get("/api/v1/products?category=footwear")
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["category"].lower() == "footwear"

def test_filter_by_max_price():
    response = client.get("/api/v1/products?max_price=1300")
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["price"] <= 1300

def test_keyword_search():
    response = client.get("/api/v1/products?q=Sprint")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) >= 1
    assert "Sprint" in data["items"][0]["name"]

def test_get_single_product():
    response = client.get("/api/v1/products/prod_001")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "prod_001"
    assert data["name"] == "Sprint Runner"
    assert data["price"] == 1299
