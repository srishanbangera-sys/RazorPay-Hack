"""
LangChain Product Service Layer.
Connects FastAPI endpoints and application services to LangChain chains, agents, and retrievers.
"""

from typing import Dict, Any, List, Optional
import json
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.product import Product
from app.schemas.product import (
    ProductResponse,
    ProductLangChainQueryRequest,
    ProductLangChainQueryResponse
)
from app.langchain_module.tools import (
    fetch_product_details_by_id,
    search_products_by_attributes,
    compare_products,
    calculate_product_analytics,
    _product_to_dict
)
from app.langchain_module.agent import run_langchain_product_agent
from app.langchain_module.chains import (
    create_product_details_chain,
    create_product_recommendation_chain,
    create_product_comparison_chain
)
from app.langchain_module.retriever import ProductCatalogRetriever

class LangChainProductService:
    @staticmethod
    def fetch_product_details(product_id: str, db: Optional[Session] = None) -> Dict[str, Any]:
        """
        Fetch full structured details for a specific product ID via LangChain tool.
        """
        raw_res = fetch_product_details_by_id.invoke({"product_id": product_id})
        return json.loads(raw_res)

    @staticmethod
    def query_with_agent(
        request: ProductLangChainQueryRequest,
        db: Optional[Session] = None
    ) -> ProductLangChainQueryResponse:
        """
        Processes a natural language query using the LangChain product agent,
        invoking appropriate tools, filters, and returning structured models.
        """
        # Execute LangChain Agent
        agent_result = run_langchain_product_agent(request.query)
        
        # Convert referenced products to ProductResponse schemas
        products_out = []
        for p_data in agent_result.get("referenced_products", []):
            try:
                products_out.append(ProductResponse(**p_data))
            except Exception:
                pass

        # If agent found no direct products, run retriever with any supplied request filters
        if not products_out:
            retriever = ProductCatalogRetriever(
                category_filter=request.category,
                max_price=request.max_price,
                min_rating=request.min_rating,
                in_stock_only=request.in_stock_only or False,
                k=4
            )
            docs = retriever.invoke(request.query)
            session = db or SessionLocal()
            try:
                doc_ids = [d.metadata.get("id") for d in docs if d.metadata.get("id")]
                if doc_ids:
                    db_items = session.query(Product).filter(Product.id.in_(doc_ids)).all()
                    products_out = [ProductResponse.model_validate(p) for p in db_items]
            finally:
                if not db:
                    session.close()

        return ProductLangChainQueryResponse(
            query=request.query,
            answer=agent_result.get("answer", ""),
            products=products_out,
            tools_used=agent_result.get("tools_invoked", []),
            metadata={
                "product_count": len(products_out),
                "conversation_id": request.conversation_id
            }
        )

    @staticmethod
    def generate_product_briefing(product_id: str) -> str:
        """
        Runs an LCEL chain to generate a rich markdown product briefing for a given product ID.
        """
        chain = create_product_details_chain()
        return chain.invoke(product_id)

    @staticmethod
    def compare_multiple_products(product_ids: List[str]) -> Dict[str, Any]:
        """
        Compares multiple products side-by-side using LangChain tool and LCEL chain.
        """
        tool_res = compare_products.invoke({"product_ids": product_ids})
        data = json.loads(tool_res)
        
        chain = create_product_comparison_chain()
        narrative = chain.invoke({"query": f"Compare products {', '.join(product_ids)}", "product_ids": product_ids})
        data["comparison_narrative"] = narrative
        return data

    @staticmethod
    def get_catalog_analytics(category: Optional[str] = None) -> Dict[str, Any]:
        """
        Computes catalog-level financial and inventory analytics using LangChain tool.
        """
        raw_res = calculate_product_analytics.invoke({"category": category})
        return json.loads(raw_res)
