from typing import List, Optional
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.product import Product
from app.schemas.product import ProductCreate

class CatalogService:
    @staticmethod
    def get_products(
        db: Session,
        category: Optional[str] = None,
        max_price: Optional[int] = None,
        q: Optional[str] = None,
        in_stock: Optional[bool] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Product]:
        query = db.query(Product)
        
        if category:
            query = query.filter(Product.category.ilike(f"%{category.strip()}%"))
        if max_price is not None:
            query = query.filter(Product.price <= max_price)
        if in_stock is True:
            query = query.filter(Product.stock > 0)
        elif in_stock is False:
            query = query.filter(Product.stock == 0)
            
        if q:
            search = f"%{q.strip()}%"
            query = query.filter(
                or_(
                    Product.name.ilike(search),
                    Product.description.ilike(search),
                    Product.category.ilike(search)
                )
            )
            
        return query.order_by(Product.price.asc()).offset(offset).limit(limit).all()

    @staticmethod
    def get_product_by_id(db: Session, product_id: str) -> Optional[Product]:
        return db.query(Product).filter(Product.id == product_id).first()

    @staticmethod
    def create_product(db: Session, product_in: ProductCreate) -> Product:
        product = Product(
            id=product_in.id or f"prod_{Product.__name__}_{uuid.uuid4().hex[:8]}",
            name=product_in.name,
            description=product_in.description,
            price=product_in.price,
            stock=product_in.stock,
            category=product_in.category,
            attributes=product_in.attributes or {}
        )
        db.add(product)
        db.commit()
        db.refresh(product)
        return product
