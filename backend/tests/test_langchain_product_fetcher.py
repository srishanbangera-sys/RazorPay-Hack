import json
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.langchain_module.tools import (
    fetch_product_details_by_id,
    search_products_by_attributes,
    search_products_semantic,
    get_top_performing_products,
    compare_products,
    calculate_product_analytics
)
from app.langchain_module.retriever import ProductCatalogRetriever
from app.langchain_module.llm_factory import get_chat_model, DeterministicFallbackChatModel
from app.langchain_module.chains import (
    create_product_details_chain,
    create_product_recommendation_chain,
    create_product_comparison_chain
)
from app.langchain_module.agent import run_langchain_product_agent
from app.langchain_module.service import LangChainProductService

client = TestClient(app)

def test_fetch_product_details_by_id_tool():
    """Verify tool fetches exact spreadsheet fields for prod_001."""
    res_str = fetch_product_details_by_id.invoke({"product_id": "prod_001"})
    res = json.loads(res_str)
    assert res["status"] == "success"
    prod = res["product"]
    assert prod["id"] == "prod_001"
    assert prod["name"] == "Sprint Runner"
    assert prod["brand"] == "Velocity"
    assert prod["price"] == 1299
    assert prod["cost_price"] == 799
    assert prod["stock"] == 15
    assert prod["rating"] == 4.5
    assert prod["sales_count"] == 245
    assert prod["specification"] == "220g"
    assert prod["stock_status"] == "in_stock"
    assert prod["margin_percentage"] > 35.0

def test_fetch_out_of_stock_product_tool():
    """Verify tool handles out of stock product prod_010."""
    res_str = fetch_product_details_by_id.invoke({"product_id": "prod_010"})
    res = json.loads(res_str)
    assert res["status"] == "success"
    prod = res["product"]
    assert prod["id"] == "prod_010"
    assert prod["name"] == "Phantom Sprint Elite"
    assert prod["stock"] == 0
    assert prod["stock_status"] == "out_of_stock"

def test_fetch_non_existent_product_tool():
    """Verify tool handles invalid product ID gracefully without error."""
    res_str = fetch_product_details_by_id.invoke({"product_id": "prod_999_invalid"})
    res = json.loads(res_str)
    assert res["status"] == "not_found"

def test_search_products_by_attributes_tool():
    """Verify multi-criteria filtering by category and max_price."""
    res_str = search_products_by_attributes.invoke({
        "category": "Electronics",
        "max_price": 1500
    })
    res = json.loads(res_str)
    assert res["status"] == "success"
    assert res["count"] >= 1
    for p in res["products"]:
        assert p["category"].lower() == "electronics"
        assert p["price"] <= 1500

def test_search_products_by_brand_and_rating():
    """Verify brand and rating filters."""
    res_str = search_products_by_attributes.invoke({
        "brand": "Apex",
        "min_rating": 4.0
    })
    res = json.loads(res_str)
    assert res["status"] == "success"
    for p in res["products"]:
        assert p["brand"] == "Apex"
        assert p["rating"] >= 4.0

def test_get_top_performing_products_tool():
    """Verify top products ranked by sales count."""
    res_str = get_top_performing_products.invoke({"metric": "sales_count", "limit": 3})
    res = json.loads(res_str)
    assert res["status"] == "success"
    assert len(res["top_products"]) == 3
    sales = [p["sales_count"] for p in res["top_products"]]
    assert sales[0] >= sales[1] >= sales[2]

def test_compare_products_tool():
    """Verify side-by-side comparison of 2 shoes."""
    res_str = compare_products.invoke({"product_ids": ["prod_001", "prod_002"]})
    res = json.loads(res_str)
    assert res["status"] == "success"
    assert res["count"] == 2
    assert "Sprint Runner" in res["comparison_matrix"]["names"]
    assert "Premium Runner" in res["comparison_matrix"]["names"]

def test_calculate_product_analytics_tool():
    """Verify catalog-wide analytics."""
    res_str = calculate_product_analytics.invoke({})
    res = json.loads(res_str)
    assert res["status"] == "success"
    assert res["total_products"] == 30
    assert res["average_price_inr"] > 0
    assert res["financial_aggregates"]["total_estimated_revenue_inr"] > 0

def test_product_catalog_retriever():
    """Verify LangChain custom retriever creates proper Documents."""
    retriever = ProductCatalogRetriever(k=3)
    docs = retriever.invoke("lightweight marathon running shoe")
    assert len(docs) > 0
    assert "Product ID:" in docs[0].page_content
    assert "price" in docs[0].metadata

def test_lcel_product_details_chain():
    """Verify LCEL product details chain execution."""
    chain = create_product_details_chain()
    output = chain.invoke("prod_005")
    assert isinstance(output, str)
    assert len(output) > 0

def test_lcel_product_recommendation_chain():
    """Verify LCEL recommendation chain."""
    chain = create_product_recommendation_chain()
    output = chain.invoke({"user_prompt": "I need running shoes under ₹1500", "budget": 1500})
    assert isinstance(output, str)
    assert len(output) > 0

def test_langchain_product_agent():
    """Verify autonomous agent executes and formats query response."""
    result = run_langchain_product_agent("What are the specifications of prod_001?")
    assert "answer" in result
    assert len(result["answer"]) > 0
    assert len(result["tools_invoked"]) > 0

def test_api_langchain_fetch_endpoint():
    """Verify FastAPI GET /api/v1/products/langchain/fetch/{id}."""
    response = client.get("/api/v1/products/langchain/fetch/prod_007")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["product"]["name"] == "Thermal Hydration Flask"
    assert data["product"]["price"] == 499

def test_api_langchain_query_endpoint():
    """Verify FastAPI POST /api/v1/products/langchain/query."""
    response = client.post(
        "/api/v1/products/langchain/query",
        json={"query": "Find me yoga equipment and accessories under ₹1000"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert len(data["answer"]) > 0

def test_api_langchain_compare_endpoint():
    """Verify FastAPI POST /api/v1/products/langchain/compare."""
    response = client.post(
        "/api/v1/products/langchain/compare",
        json={"product_ids": ["prod_005", "prod_019"]}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["count"] == 2

def test_api_langchain_analytics_endpoint():
    """Verify FastAPI GET /api/v1/products/langchain/analytics."""
    response = client.get("/api/v1/products/langchain/analytics?category=Footwear")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["category_scope"] == "Footwear"
    assert data["total_products"] > 0
