"""
LangChain Tools for Product Retrieval, Search, Filtering, and Analytics.
Provides structured tools that can be bound to LangChain LLMs and agents.
"""

from typing import List, Optional, Dict, Any, Union
import json
# pyrefly: ignore [missing-import]
from langchain_core.tools import tool
from pydantic import BaseModel, Field

from app.core.database import SessionLocal
from app.models.product import Product
from app.services.catalog_service import CatalogService

def _product_to_dict(p: Product) -> Dict[str, Any]:
    """Serializes a Product ORM model to a comprehensive dictionary."""
    margin = None
    if p.price and p.cost_price and p.price > 0:
        margin = round(((p.price - p.cost_price) / p.price) * 100, 2)

    return {
        "id": p.id,
        "name": p.name,
        "brand": p.brand or "Unknown",
        "description": p.description or "",
        "category": p.category,
        "product_type": p.product_type or "",
        "price": p.price,
        "cost_price": p.cost_price,
        "stock": p.stock,
        "rating": p.rating or 0.0,
        "sales_count": p.sales_count or 0,
        "views": p.views or 0,
        "conversion_rate": p.conversion_rate or 0.0,
        "color": p.color or "",
        "sizes_or_capacity": p.sizes_or_capacity or "",
        "specification": p.specification or "",
        "profit_per_unit": p.profit_per_unit,
        "estimated_revenue": p.estimated_revenue,
        "estimated_profit": p.estimated_profit,
        "stock_status": p.stock_status or ("in_stock" if p.stock > 0 else "out_of_stock"),
        "margin_percentage": margin,
        "attributes": p.attributes or {}
    }

class ProductIdInput(BaseModel):
    product_id: str = Field(description="The unique product identifier (e.g., 'prod_001', 'prod_020') or exact product name")

@tool("fetch_product_details_by_id", args_schema=ProductIdInput)
def fetch_product_details_by_id(product_id: str) -> str:
    """
    Fetch comprehensive, exact product details for a given product ID (e.g. 'prod_001' to 'prod_030')
    or exact product name. Returns pricing, inventory, rating, specs, brand, profit metrics, and stock status.
    """
    db = SessionLocal()
    try:
        clean_id = product_id.strip()
        product = db.query(Product).filter(Product.id == clean_id).first()
        if not product:
            # Fallback to name match
            product = db.query(Product).filter(Product.name.ilike(f"%{clean_id}%")).first()

        if not product:
            return json.dumps({
                "status": "not_found",
                "message": f"Product with ID or name '{product_id}' was not found in the catalog."
            }, indent=2)

        data = _product_to_dict(product)
        return json.dumps({
            "status": "success",
            "product": data
        }, indent=2)
    finally:
        db.close()

class ProductFilterInput(BaseModel):
    category: Optional[str] = Field(default=None, description="Category filter (e.g. 'Footwear', 'Electronics', 'Fitness', 'Accessories', 'Clothing')")
    brand: Optional[str] = Field(default=None, description="Brand name filter (e.g. 'Velocity', 'AeroStride', 'SonicPulse', 'Apex', 'AeroFit')")
    product_type: Optional[str] = Field(default=None, description="Product type filter (e.g. 'Running', 'Trail', 'Audio', 'Wearables', 'Strength', 'Hydration')")
    min_price: Optional[int] = Field(default=None, description="Minimum price in INR")
    max_price: Optional[int] = Field(default=None, description="Maximum price in INR")
    min_rating: Optional[float] = Field(default=None, description="Minimum customer rating (e.g. 4.5)")
    color: Optional[str] = Field(default=None, description="Color keyword filter (e.g. 'Black', 'Blue', 'Green')")
    stock_status: Optional[str] = Field(default=None, description="Stock status: 'in_stock', 'low_stock', or 'out_of_stock'")
    in_stock_only: Optional[bool] = Field(default=None, description="Set True to filter only products with available inventory (stock > 0)")
    sort_by: Optional[str] = Field(default="price_asc", description="Sort order: 'price_asc', 'price_desc', 'rating_desc', 'sales_desc', 'profit_desc', 'views_desc'")
    limit: Optional[int] = Field(default=10, description="Maximum number of products to return (default 10)")

@tool("search_products_by_attributes", args_schema=ProductFilterInput)
def search_products_by_attributes(
    category: Optional[str] = None,
    brand: Optional[str] = None,
    product_type: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    min_rating: Optional[float] = None,
    color: Optional[str] = None,
    stock_status: Optional[str] = None,
    in_stock_only: Optional[bool] = None,
    sort_by: Optional[str] = "price_asc",
    limit: Optional[int] = 10
) -> str:
    """
    Search and filter products using structured criteria such as category, brand, product type,
    price range, rating, color, and in-stock status.
    """
    db = SessionLocal()
    try:
        in_stock_val = True if in_stock_only else None
        products = CatalogService.get_products(
            db=db,
            category=category,
            brand=brand,
            product_type=product_type,
            min_price=min_price,
            max_price=max_price,
            min_rating=min_rating,
            color=color,
            stock_status=stock_status,
            in_stock=in_stock_val,
            sort_by=sort_by,
            limit=limit or 10
        )
        results = [_product_to_dict(p) for p in products]
        return json.dumps({
            "status": "success",
            "count": len(results),
            "filters": {
                "category": category,
                "brand": brand,
                "product_type": product_type,
                "min_price": min_price,
                "max_price": max_price,
                "min_rating": min_rating,
                "color": color,
                "stock_status": stock_status
            },
            "products": results
        }, indent=2)
    finally:
        db.close()

class SemanticSearchInput(BaseModel):
    query: str = Field(description="Natural language search term, keywords, or feature description (e.g. 'marathon carbon plate', 'waterproof earbuds', 'heavy dumbbells')")
    limit: Optional[int] = Field(default=5, description="Number of results to retrieve")

@tool("search_products_semantic", args_schema=SemanticSearchInput)
def search_products_semantic(query: str, limit: Optional[int] = 5) -> str:
    """
    Search products across name, description, category, brand, type, specifications, and attributes
    using keyword matching and relevance scoring.
    """
    db = SessionLocal()
    try:
        products = CatalogService.get_products(
            db=db,
            q=query,
            limit=limit or 5
        )
        results = [_product_to_dict(p) for p in products]
        return json.dumps({
            "status": "success",
            "query": query,
            "count": len(results),
            "products": results
        }, indent=2)
    finally:
        db.close()

class TopPerformingInput(BaseModel):
    metric: str = Field(
        default="sales_count",
        description="Metric to rank by: 'sales_count', 'rating', 'conversion_rate', 'estimated_profit', 'estimated_revenue', 'profit_per_unit', 'views'"
    )
    category: Optional[str] = Field(default=None, description="Optional category filter")
    limit: Optional[int] = Field(default=5, description="Number of top items to return")

@tool("get_top_performing_products", args_schema=TopPerformingInput)
def get_top_performing_products(
    metric: str = "sales_count",
    category: Optional[str] = None,
    limit: Optional[int] = 5
) -> str:
    """
    Retrieve top-performing products ranked by sales count, customer rating, conversion rate,
    profit per unit, estimated revenue, or views.
    """
    db = SessionLocal()
    try:
        sort_map = {
            "sales_count": "sales_desc",
            "rating": "rating_desc",
            "profit": "profit_desc",
            "profit_per_unit": "profit_desc",
            "estimated_profit": "profit_desc",
            "views": "views_desc",
            "price": "price_desc"
        }
        sort_by = sort_map.get(metric.lower(), "sales_desc")
        products = CatalogService.get_products(
            db=db,
            category=category,
            sort_by=sort_by,
            limit=limit or 5
        )
        results = [_product_to_dict(p) for p in products]
        return json.dumps({
            "status": "success",
            "ranked_by": metric,
            "category": category,
            "count": len(results),
            "top_products": results
        }, indent=2)
    finally:
        db.close()

class CompareProductsInput(BaseModel):
    product_ids: List[str] = Field(description="List of product IDs to compare (e.g. ['prod_001', 'prod_002'])")

@tool("compare_products", args_schema=CompareProductsInput)
def compare_products(product_ids: List[str]) -> str:
    """
    Compare multiple products side-by-side on price, rating, specifications, inventory, brand, and value.
    """
    db = SessionLocal()
    try:
        products = db.query(Product).filter(Product.id.in_(product_ids)).all()
        if not products:
            return json.dumps({"status": "not_found", "message": "None of the requested products were found."}, indent=2)

        items = [_product_to_dict(p) for p in products]
        comparison = {
            "status": "success",
            "count": len(items),
            "comparison_matrix": {
                "ids": [p["id"] for p in items],
                "names": [p["name"] for p in items],
                "brands": [p["brand"] for p in items],
                "prices": [p["price"] for p in items],
                "ratings": [p["rating"] for p in items],
                "stock_levels": [p["stock"] for p in items],
                "specifications": [p["specification"] for p in items],
                "colors": [p["color"] for p in items],
                "sizes": [p["sizes_or_capacity"] for p in items]
            },
            "products": items
        }
        return json.dumps(comparison, indent=2)
    finally:
        db.close()

class AnalyticsInput(BaseModel):
    category: Optional[str] = Field(default=None, description="Optional category to compute analytics for")

@tool("calculate_product_analytics", args_schema=AnalyticsInput)
def calculate_product_analytics(category: Optional[str] = None) -> str:
    """
    Calculate aggregate catalog performance metrics: total products, average price, average rating,
    in-stock vs out-of-stock count, total estimated revenue, and total estimated profit.
    """
    db = SessionLocal()
    try:
        query = db.query(Product)
        if category:
            query = query.filter(Product.category.ilike(f"%{category.strip()}%"))
        products = query.all()

        if not products:
            return json.dumps({"status": "empty", "message": "No products match criteria for analytics."}, indent=2)

        total_count = len(products)
        avg_price = round(sum(p.price for p in products) / total_count, 2)
        avg_rating = round(sum(p.rating or 0.0 for p in products) / total_count, 2)
        in_stock_count = sum(1 for p in products if p.stock > 0)
        out_of_stock_count = sum(1 for p in products if p.stock == 0)
        low_stock_count = sum(1 for p in products if p.stock_status == "low_stock")
        total_est_revenue = sum(p.estimated_revenue or 0 for p in products)
        total_est_profit = sum(p.estimated_profit or 0 for p in products)

        analytics = {
            "status": "success",
            "category_scope": category or "All Catalog",
            "total_products": total_count,
            "average_price_inr": avg_price,
            "average_rating": avg_rating,
            "inventory_breakdown": {
                "in_stock": in_stock_count,
                "low_stock": low_stock_count,
                "out_of_stock": out_of_stock_count
            },
            "financial_aggregates": {
                "total_estimated_revenue_inr": total_est_revenue,
                "total_estimated_profit_inr": total_est_profit
            }
        }
        return json.dumps(analytics, indent=2)
    finally:
        db.close()

def get_product_tools() -> List[Any]:
    """Returns the list of all product LangChain tools."""
    return [
        fetch_product_details_by_id,
        search_products_by_attributes,
        search_products_semantic,
        get_top_performing_products,
        compare_products,
        calculate_product_analytics
    ]
