"""
LangChain Custom Catalog Retriever for Product Semantic and Structured Retrieval.
"""

from typing import List, Optional, Dict, Any
# pyrefly: ignore [missing-import]
from langchain_core.retrievers import BaseRetriever
# pyrefly: ignore [missing-import]
from langchain_core.documents import Document
# pyrefly: ignore [missing-import]
from langchain_core.callbacks.manager import CallbackManagerForRetrieverRun
from pydantic import Field

from app.core.database import SessionLocal
from app.models.product import Product
from app.services.catalog_service import CatalogService

class ProductCatalogRetriever(BaseRetriever):
    """
    Custom LangChain Retriever that queries the Merchant Catalog database
    and formats matching products as structured LangChain Documents.
    """
    category_filter: Optional[str] = Field(default=None)
    max_price: Optional[int] = Field(default=None)
    min_rating: Optional[float] = Field(default=None)
    in_stock_only: Optional[bool] = Field(default=False)
    k: int = Field(default=5)

    def _product_to_document(self, p: Product) -> Document:
        content = (
            f"Product ID: {p.id}\n"
            f"Name: {p.name}\n"
            f"Brand: {p.brand or 'N/A'}\n"
            f"Category: {p.category} | Type: {p.product_type or 'General'}\n"
            f"Price: ₹{p.price:,} (Cost: ₹{p.cost_price or 'N/A'})\n"
            f"Stock: {p.stock} units ({p.stock_status or 'in_stock'})\n"
            f"Rating: {p.rating} / 5.0 (Sales: {p.sales_count} units, Views: {p.views})\n"
            f"Color: {p.color or 'N/A'} | Sizes/Capacity: {p.sizes_or_capacity or 'N/A'}\n"
            f"Specification: {p.specification or 'N/A'}\n"
            f"Description: {p.description or ''}"
        )
        metadata = {
            "id": p.id,
            "name": p.name,
            "brand": p.brand,
            "category": p.category,
            "product_type": p.product_type,
            "price": p.price,
            "stock": p.stock,
            "stock_status": p.stock_status,
            "rating": p.rating,
            "sales_count": p.sales_count,
            "conversion_rate": p.conversion_rate,
            "specification": p.specification,
            "profit_per_unit": p.profit_per_unit,
            "estimated_revenue": p.estimated_revenue,
            "estimated_profit": p.estimated_profit,
        }
        return Document(page_content=content, metadata=metadata)

    def _get_relevant_documents(
        self,
        query: str,
        *,
        run_manager: Optional[CallbackManagerForRetrieverRun] = None
    ) -> List[Document]:
        db = SessionLocal()
        try:
            in_stock_val = True if self.in_stock_only else None
            products = CatalogService.get_products(
                db=db,
                category=self.category_filter,
                max_price=self.max_price,
                min_rating=self.min_rating,
                q=query,
                in_stock=in_stock_val,
                limit=self.k
            )
            if not products:
                # Retrieve broader candidates and score by word overlap
                candidates = CatalogService.get_products(
                    db=db,
                    category=self.category_filter,
                    max_price=self.max_price,
                    min_rating=self.min_rating,
                    in_stock=in_stock_val,
                    limit=50
                )
                query_words = set(query.lower().split())
                def score(p):
                    text = f"{p.name} {p.brand} {p.category} {p.product_type} {p.description} {p.specification} {p.color}".lower()
                    return sum(1 for w in query_words if w in text)
                sorted_prods = sorted(candidates, key=score, reverse=True)
                products = [p for p in sorted_prods if score(p) > 0][:self.k]
                if not products and candidates:
                    products = candidates[:self.k]

            return [self._product_to_document(p) for p in products]
        finally:
            db.close()
