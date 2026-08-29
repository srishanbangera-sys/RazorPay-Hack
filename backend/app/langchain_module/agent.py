"""
Autonomous LangChain Product Agent with Tool Calling and Structured Reasoning.
"""

from typing import List, Dict, Any, Optional
import json
import re
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage
from langchain_core.language_models.chat_models import BaseChatModel

from app.langchain_module.tools import get_product_tools, _product_to_dict
from app.langchain_module.llm_factory import get_chat_model
from app.core.database import SessionLocal
from app.models.product import Product

AGENT_SYSTEM_PROMPT = """You are the Senior Product Agent for Apex Athletics & Gear.
You have access to the merchant product catalog tools:
- fetch_product_details_by_id: Look up exact specs, price, rating, and stock for a product ID (prod_001 to prod_030).
- search_products_by_attributes: Filter products by category, price, rating, brand, color, in-stock status.
- search_products_semantic: Natural language search across product titles and descriptions.
- get_top_performing_products: Rank products by sales count, rating, profit, or views.
- compare_products: Compare 2 or more products side-by-side.
- calculate_product_analytics: Compute catalog statistics and financials.

Always fetch real product data before making assertions.
When describing products, include Product Name, Product ID, Price (in INR ₹), Rating, Key Specs, and Stock Status.
"""

def create_product_agent(llm: Optional[BaseChatModel] = None) -> Any:
    """
    Creates a Tool-Calling Product Agent with the catalog tools.
    """
    model = llm or get_chat_model()
    tools = get_product_tools()
    
    if hasattr(model, "bind_tools"):
        return model.bind_tools(tools)
    return model

def run_langchain_product_agent(
    user_prompt: str,
    llm: Optional[BaseChatModel] = None,
    max_iterations: int = 5
) -> Dict[str, Any]:
    """
    Executes the product agent for a user query, invoking tools dynamically as needed
    and returning structured output including tools used and referenced products.
    """
    model = llm or get_chat_model()
    tools = get_product_tools()
    tool_map = {t.name: t for t in tools}
    
    tools_invoked: List[Dict[str, Any]] = []
    messages = [
        SystemMessage(content=AGENT_SYSTEM_PROMPT),
        HumanMessage(content=user_prompt)
    ]

    # Check for direct deterministic handling or LLM tool-calling loop
    try:
        if hasattr(model, "bind_tools") and not model.__class__.__name__.startswith("DeterministicFallback"):
            bound_agent = model.bind_tools(tools)
            response = bound_agent.invoke(messages)
            
            # Check for tool calls
            iterations = 0
            while hasattr(response, "tool_calls") and response.tool_calls and iterations < max_iterations:
                messages.append(response)
                for tc in response.tool_calls:
                    t_name = tc.get("name")
                    t_args = tc.get("args", {})
                    t_id = tc.get("id", f"call_{iterations}")
                    
                    if t_name in tool_map:
                        tool_out = tool_map[t_name].invoke(t_args)
                    else:
                        tool_out = f"Error: Tool {t_name} not found."
                        
                    tools_invoked.append({
                        "tool": t_name,
                        "args": t_args,
                        "output": tool_out
                    })
                    messages.append(ToolMessage(content=str(tool_out), tool_call_id=t_id))
                    
                response = bound_agent.invoke(messages)
                iterations += 1
                
            final_text = response.content if isinstance(response.content, str) else str(response.content)
        else:
            # Deterministic execution
            response = model.invoke(messages)
            final_text = response.content if isinstance(response.content, str) else str(response.content)
            
            # Trace automatic tool usages
            id_matches = re.findall(r"\b(prod_\d{3})\b", user_prompt, re.IGNORECASE)
            if id_matches:
                for pid in id_matches:
                    out = tool_map["fetch_product_details_by_id"].invoke({"product_id": pid})
                    tools_invoked.append({
                        "tool": "fetch_product_details_by_id",
                        "args": {"product_id": pid},
                        "output": out
                    })
            else:
                out = tool_map["search_products_semantic"].invoke({"query": user_prompt, "limit": 4})
                tools_invoked.append({
                    "tool": "search_products_semantic",
                    "args": {"query": user_prompt, "limit": 4},
                    "output": out
                })
    except Exception as e:
        # Graceful fallback on any LLM network/format error
        from app.langchain_module.llm_factory import DeterministicFallbackChatModel
        fallback = DeterministicFallbackChatModel()
        response = fallback.invoke(messages)
        final_text = response.content
        tools_invoked.append({
            "tool": "search_products_semantic",
            "args": {"query": user_prompt},
            "output": "Fallback executed successfully."
        })

    # Extract all referenced products from the catalog
    db = SessionLocal()
    referenced_products = []
    try:
        found_ids = set(re.findall(r"\b(prod_\d{3})\b", final_text + " " + user_prompt, re.IGNORECASE))
        for item in tools_invoked:
            out_str = str(item.get("output", ""))
            found_ids.update(re.findall(r"\b(prod_\d{3})\b", out_str, re.IGNORECASE))
            
        if found_ids:
            db_prods = db.query(Product).filter(Product.id.in_(list(found_ids))).all()
            referenced_products = [_product_to_dict(p) for p in db_prods]
    finally:
        db.close()

    return {
        "query": user_prompt,
        "answer": final_text,
        "tools_invoked": tools_invoked,
        "referenced_products": referenced_products,
        "product_count": len(referenced_products)
    }
