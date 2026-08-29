from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.product import (
    ProductResponse,
    ProductListResponse,
    ProductCreate,
    ProductLangChainQueryRequest,
    ProductLangChainQueryResponse
)
from app.services.catalog_service import CatalogService
from app.langchain_module.service import LangChainProductService

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=ProductListResponse)
def get_products(
    category: Optional[str] = Query(None, description="Filter by product category"),
    brand: Optional[str] = Query(None, description="Filter by brand name"),
    product_type: Optional[str] = Query(None, description="Filter by product type"),
    min_price: Optional[int] = Query(None, description="Filter by minimum price in INR"),
    max_price: Optional[int] = Query(None, description="Filter by maximum price in INR"),
    min_rating: Optional[float] = Query(None, description="Filter by minimum rating"),
    color: Optional[str] = Query(None, description="Filter by color"),
    stock_status: Optional[str] = Query(None, description="Filter by stock status"),
    q: Optional[str] = Query(None, description="Keyword search in name/description"),
    in_stock: Optional[bool] = Query(None, description="Filter by in-stock status"),
    sort_by: Optional[str] = Query("price_asc", description="Sorting criteria"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
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
        q=q,
        in_stock=in_stock,
        sort_by=sort_by,
        limit=limit,
        offset=offset
    )
    return ProductListResponse(
        items=[ProductResponse.model_validate(p) for p in products],
        total=len(products)
    )

# --- LangChain Powered Endpoints ---

@router.post("/langchain/query", response_model=ProductLangChainQueryResponse)
def langchain_product_query(
    request: ProductLangChainQueryRequest,
    db: Session = Depends(get_db)
):
    """
    Query the product catalog using the LangChain Product Agent and LCEL chains.
    Supports complex natural language search, specification checks, and comparisons.
    """
    return LangChainProductService.query_with_agent(request=request, db=db)

@router.get("/langchain/fetch/{product_id}")
def langchain_fetch_product(product_id: str):
    """
    Fetch complete product details using LangChain's fetch_product_details_by_id tool.
    """
    res = LangChainProductService.fetch_product_details(product_id)
    if res.get("status") == "not_found":
        raise HTTPException(status_code=404, detail=res.get("message"))
    return res

@router.get("/langchain/briefing/{product_id}")
def langchain_product_briefing(product_id: str):
    """
    Generate an AI-powered technical product briefing using LangChain LCEL chain.
    """
    briefing = LangChainProductService.generate_product_briefing(product_id)
    return {"product_id": product_id, "briefing": briefing}

@router.post("/langchain/compare")
def langchain_compare_products(
    product_ids: List[str] = Body(..., embed=True, description="List of product IDs to compare")
):
    """
    Compare multiple products side-by-side using LangChain comparison tools and LCEL chains.
    """
    return LangChainProductService.compare_multiple_products(product_ids)

@router.get("/langchain/analytics")
def langchain_catalog_analytics(
    category: Optional[str] = Query(None, description="Optional category filter for analytics")
):
    """
    Calculate catalog-wide financial and inventory analytics using LangChain analytics tool.
    """
    return LangChainProductService.get_catalog_analytics(category)

# --- Standard CRUD Endpoints ---

@router.get("/{product_id}", response_model=ProductResponse)
def get_product_by_id(product_id: str, db: Session = Depends(get_db)):
    product = CatalogService.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductResponse.model_validate(product)

@router.post("", response_model=ProductResponse, status_code=201)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    product = CatalogService.create_product(db, product_in)
    return ProductResponse.model_validate(product)
