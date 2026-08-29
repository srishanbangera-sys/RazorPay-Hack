"""
LangChain Expression Language (LCEL) Chains for Product Details, Recommendations, and Analysis.
"""

from typing import Dict, Any, List, Optional
import json
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableLambda

from app.langchain_module.llm_factory import get_chat_model
from app.langchain_module.tools import fetch_product_details_by_id, search_products_by_attributes, compare_products
from app.langchain_module.retriever import ProductCatalogRetriever

PRODUCT_DETAILS_PROMPT = ChatPromptTemplate.from_messages([
    ("system", (
        "You are an expert Senior E-Commerce Product Specialist for Apex Athletics & Gear. "
        "Your role is to explain product details, specifications, material engineering, pricing, "
        "and inventory status with absolute precision based on the provided catalog data. "
        "Never hallucinate specifications or prices not present in the verified context."
    )),
    ("human", (
        "Please provide a comprehensive product briefing for the following product query:\n\n"
        "Query: {query}\n\n"
        "Verified Catalog Details:\n"
        "{catalog_data}\n\n"
        "Provide a clear breakdown covering: Overview, Technical Specs, Pricing & Value, Stock Status, and Ideal User."
    ))
])

RECOMMENDATION_PROMPT = ChatPromptTemplate.from_messages([
    ("system", (
        "You are an AI Shopping Advisor. Based on buyer requirements, analyze the available products "
        "and recommend the best options that satisfy user preferences and budget limits. "
        "Always state the exact product name, product ID, price in INR, and key differentiators."
    )),
    ("human", (
        "Buyer Requirements: {user_prompt}\n"
        "Max Budget (if any): ₹{budget}\n\n"
        "Available Catalog Candidates:\n"
        "{candidate_products}\n\n"
        "Provide a top recommendation with clear rationale and compare with a close alternative."
    ))
])

COMPARISON_PROMPT = ChatPromptTemplate.from_messages([
    ("system", (
        "You are a technical product comparison engine. Compare the provided products directly across "
        "price, performance specifications, ratings, intended use, and value for money."
    )),
    ("human", (
        "Comparison Query: {query}\n\n"
        "Product Comparison Data:\n"
        "{comparison_data}\n\n"
        "Generate a side-by-side comparison summary and a clear final recommendation for each use case."
    ))
])

def _fetch_data_for_query(inputs: Any) -> str:
    if isinstance(inputs, dict):
        query = inputs.get("query", "")
    else:
        query = str(inputs)
    import re
    id_match = re.search(r"\b(prod_\d{3})\b", query, re.IGNORECASE)
    if id_match:
        return fetch_product_details_by_id.invoke({"product_id": id_match.group(1)})
    retriever = ProductCatalogRetriever(k=4)
    docs = retriever.invoke(query)
    return "\n---\n".join(d.page_content for d in docs) if docs else "No matching products found."

def create_product_details_chain(llm=None):
    """
    Creates an LCEL Chain to fetch and format detailed product information.
    """
    model = llm or get_chat_model()
    chain = (
        {
            "query": RunnablePassthrough(),
            "catalog_data": RunnableLambda(_fetch_data_for_query)
        }
        | PRODUCT_DETAILS_PROMPT
        | model
        | StrOutputParser()
    )
    return chain

def create_product_recommendation_chain(llm=None):
    """
    Creates an LCEL Chain to analyze catalog candidates and recommend best fit.
    """
    model = llm or get_chat_model()
    
    def _fetch_candidates(inputs: Dict[str, Any]) -> str:
        prompt = inputs.get("user_prompt", "")
        budget = inputs.get("budget", 5000)
        retriever = ProductCatalogRetriever(max_price=budget if budget else None, k=6)
        docs = retriever.invoke(prompt)
        return "\n\n".join(d.page_content for d in docs) if docs else "No products found within budget."

    chain = (
        {
            "user_prompt": lambda x: x.get("user_prompt", ""),
            "budget": lambda x: x.get("budget", "N/A"),
            "candidate_products": RunnableLambda(_fetch_candidates)
        }
        | RECOMMENDATION_PROMPT
        | model
        | StrOutputParser()
    )
    return chain

def create_product_comparison_chain(llm=None):
    """
    Creates an LCEL Chain to compare two or more products by ID.
    """
    model = llm or get_chat_model()

    def _fetch_comparison(inputs: Dict[str, Any]) -> str:
        ids = inputs.get("product_ids", [])
        if not ids:
            return "No product IDs specified."
        return compare_products.invoke({"product_ids": ids})

    chain = (
        {
            "query": lambda x: x.get("query", "Product Comparison"),
            "comparison_data": RunnableLambda(_fetch_comparison)
        }
        | COMPARISON_PROMPT
        | model
        | StrOutputParser()
    )
    return chain
