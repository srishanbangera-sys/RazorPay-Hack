"""
LangChain Product Details & Reasoning Module.
Provides structured tools, retrievers, LCEL chains, and autonomous agents
to fetch, search, filter, compare, and analyze catalog products.
"""

from app.langchain_module.tools import (
    fetch_product_details_by_id,
    search_products_by_attributes,
    search_products_semantic,
    get_top_performing_products,
    compare_products,
    calculate_product_analytics,
    get_product_tools
)
from app.langchain_module.retriever import ProductCatalogRetriever
from app.langchain_module.llm_factory import get_chat_model
from app.langchain_module.chains import (
    create_product_details_chain,
    create_product_recommendation_chain,
    create_product_comparison_chain
)
from app.langchain_module.agent import create_product_agent, run_langchain_product_agent
from app.langchain_module.service import LangChainProductService

__all__ = [
    "fetch_product_details_by_id",
    "search_products_by_attributes",
    "search_products_semantic",
    "get_top_performing_products",
    "compare_products",
    "calculate_product_analytics",
    "get_product_tools",
    "ProductCatalogRetriever",
    "get_chat_model",
    "create_product_details_chain",
    "create_product_recommendation_chain",
    "create_product_comparison_chain",
    "create_product_agent",
    "run_langchain_product_agent",
    "LangChainProductService",
]
