from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.product import ProductResponse, ProductListResponse, ProductCreate
from app.services.catalog_service import CatalogService

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=ProductListResponse)
def get_products(
    category: Optional[str] = Query(None, description="Filter by product category"),
    max_price: Optional[int] = Query(None, description="Filter by maximum price in INR"),
    q: Optional[str] = Query(None, description="Keyword search in name/description"),
    in_stock: Optional[bool] = Query(None, description="Filter by in-stock status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    products = CatalogService.get_products(
        db=db,
        category=category,
        max_price=max_price,
        q=q,
        in_stock=in_stock,
        limit=limit,
        offset=offset
    )
    return ProductListResponse(
        items=[ProductResponse.model_validate(p) for p in products],
        total=len(products)
    )

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
