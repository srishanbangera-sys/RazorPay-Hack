from typing import List, Optional, Dict, Any
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.models.product import Product
from app.schemas.product import ProductCreate

class CatalogService:
    @staticmethod
    def get_products(
        db: Session,
        category: Optional[str] = None,
        brand: Optional[str] = None,
        product_type: Optional[str] = None,
        min_price: Optional[int] = None,
        max_price: Optional[int] = None,
        min_rating: Optional[float] = None,
        color: Optional[str] = None,
        stock_status: Optional[str] = None,
        q: Optional[str] = None,
        in_stock: Optional[bool] = None,
        sort_by: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Product]:
        query = db.query(Product)
        
        if category:
            query = query.filter(Product.category.ilike(f"%{category.strip()}%"))
        if brand:
            query = query.filter(Product.brand.ilike(f"%{brand.strip()}%"))
        if product_type:
            query = query.filter(Product.product_type.ilike(f"%{product_type.strip()}%"))
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        if max_price is not None:
            query = query.filter(Product.price <= max_price)
        if min_rating is not None:
            query = query.filter(Product.rating >= min_rating)
        if color:
            query = query.filter(Product.color.ilike(f"%{color.strip()}%"))
        if stock_status:
            query = query.filter(Product.stock_status == stock_status.strip().lower())
            
        if in_stock is True:
            query = query.filter(Product.stock > 0)
        elif in_stock is False:
            query = query.filter(Product.stock == 0)
            
        if q:
            clean_q = q.strip()
            search = f"%{clean_q}%"
            # First try exact phrase match
            phrase_filter = or_(
                Product.name.ilike(search),
                Product.description.ilike(search),
                Product.category.ilike(search),
                Product.brand.ilike(search),
                Product.product_type.ilike(search),
                Product.specification.ilike(search),
                Product.color.ilike(search)
            )
            
            # Extract individual keywords (ignore short stopwords)
            stopwords = {"for", "a", "an", "the", "with", "in", "and", "me", "show", "find", "get", "of", "to", "at", "is", "under", "i", "need", "want"}
            words = [w for w in clean_q.lower().split() if len(w) > 1 and w not in stopwords]
            
            if words:
                token_filters = []
                for word in words:
                    w_pattern = f"%{word}%"
                    token_filters.append(
                        or_(
                            Product.name.ilike(w_pattern),
                            Product.description.ilike(w_pattern),
                            Product.category.ilike(w_pattern),
                            Product.brand.ilike(w_pattern),
                            Product.product_type.ilike(w_pattern),
                            Product.specification.ilike(w_pattern),
                            Product.color.ilike(w_pattern)
                        )
                    )
                query = query.filter(or_(phrase_filter, *token_filters))
            else:
                query = query.filter(phrase_filter)
            
        # Sorting
        if sort_by == "price_desc":
            query = query.order_by(desc(Product.price))
        elif sort_by == "rating_desc":
            query = query.order_by(desc(Product.rating))
        elif sort_by == "sales_desc":
            query = query.order_by(desc(Product.sales_count))
        elif sort_by == "profit_desc":
            query = query.order_by(desc(Product.profit_per_unit))
        elif sort_by == "views_desc":
            query = query.order_by(desc(Product.views))
        elif sort_by == "price_asc":
            query = query.order_by(asc(Product.price))

        results = query.all()
        
        # If natural query search and no explicit sorting requested, rank by semantic relevance
        if q and not sort_by:
            clean_q = q.strip().lower()
            stop = {"for", "a", "an", "the", "with", "in", "and", "me", "show", "find", "get", "of", "to", "at", "is", "under", "i", "need", "want", "what", "does", "how", "much", "cost", "tell"}
            words = [w for w in clean_q.split() if len(w) > 1 and w not in stop]
            
            def relevance(p: Product) -> int:
                score = 0
                p_name = (p.name or "").lower()
                p_brand = (p.brand or "").lower()
                p_desc = (p.description or "").lower()
                p_spec = (p.specification or "").lower()
                p_type = (p.product_type or "").lower()
                p_cat = (p.category or "").lower()
                
                if clean_q in p_name:
                    score += 50
                for w in words:
                    if w in p_name:
                        score += 25
                    if w in p_brand:
                        score += 20
                    if w in p_type or w in p_cat:
                        score += 15
                    if w in p_spec:
                        score += 10
                    if w in p_desc:
                        score += 5
                return score

            results = sorted(results, key=relevance, reverse=True)
            
        return results[offset:offset + limit]

    @staticmethod
    def get_product_by_id(db: Session, product_id: str) -> Optional[Product]:
        return db.query(Product).filter(Product.id == product_id).first()

    @staticmethod
    def get_product_by_name(db: Session, name: str) -> Optional[Product]:
        return db.query(Product).filter(Product.name.ilike(f"%{name.strip()}%")).first()

    @staticmethod
    def create_product(db: Session, product_in: ProductCreate) -> Product:
        product_dict = product_in.model_dump(exclude_unset=True)
        if not product_dict.get("id"):
            product_dict["id"] = f"prod_{uuid.uuid4().hex[:8]}"
        product = Product(**product_dict)
        db.add(product)
        db.commit()
        db.refresh(product)
        return product
