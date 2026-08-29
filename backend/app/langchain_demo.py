"""
Interactive / CLI demonstration of the LangChain Product Details & Reasoning Engine.
Usage:
    python app/langchain_demo.py
"""

import sys
from pathlib import Path

# Add backend root to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import json
from app.langchain_module.tools import (
    fetch_product_details_by_id,
    search_products_by_attributes,
    get_top_performing_products,
    compare_products,
    calculate_product_analytics
)
from app.langchain_module.service import LangChainProductService
from app.langchain_module.agent import run_langchain_product_agent
from app.schemas.product import ProductLangChainQueryRequest

def main():
    print("=" * 70)
    print("🎯 LANGCHAIN PRODUCT RETRIEVAL & REASONING DEMONSTRATION")
    print("=" * 70)

    # 1. Exact Product Details Fetch via LangChain Tool
    print("\n📦 [1] Fetching Exact Product Details for 'prod_001':")
    details = json.loads(fetch_product_details_by_id.invoke({"product_id": "prod_001"}))
    p = details["product"]
    print(f"   Name:        {p['name']} ({p['id']})")
    print(f"   Brand:       {p['brand']}")
    print(f"   Category:    {p['category']} / {p['product_type']}")
    print(f"   Price:       ₹{p['price']:,} (Cost: ₹{p['cost_price']:,})")
    print(f"   Stock:       {p['stock']} units ({p['stock_status']})")
    print(f"   Rating:      ⭐ {p['rating']} / 5.0")
    print(f"   Sales/Views: {p['sales_count']} sales, {p['views']} views")
    print(f"   Specs:       {p['specification']} | Colors: {p['color']}")

    # 2. Multi-Attribute Filter Tool
    print("\n🔍 [2] Filtering Footwear under ₹1,500 with Rating >= 4.5:")
    filter_res = json.loads(search_products_by_attributes.invoke({
        "category": "Footwear",
        "max_price": 1500,
        "min_rating": 4.5
    }))
    for item in filter_res["products"]:
        print(f"   - {item['name']} ({item['id']}): ₹{item['price']:,} | ⭐ {item['rating']} | Stock: {item['stock']}")

    # 3. Top-Performing Products Tool
    print("\n🏆 [3] Top 3 Performing Products by Sales Volume:")
    top_res = json.loads(get_top_performing_products.invoke({"metric": "sales_count", "limit": 3}))
    for item in top_res["top_products"]:
        print(f"   - {item['name']}: {item['sales_count']} units sold (Est. Revenue: ₹{item['estimated_revenue']:,})")

    # 4. Product Comparison Tool
    print("\n⚖️ [4] Comparing 'prod_001' vs 'prod_002':")
    comp_res = json.loads(compare_products.invoke({"product_ids": ["prod_001", "prod_002"]}))
    matrix = comp_res["comparison_matrix"]
    print(f"   Products: {matrix['names']}")
    print(f"   Prices:   {matrix['prices']}")
    print(f"   Specs:    {matrix['specifications']}")
    print(f"   Ratings:  {matrix['ratings']}")

    # 5. Catalog Analytics Tool
    print("\n📊 [5] Full Catalog Financial & Inventory Analytics:")
    analytics = json.loads(calculate_product_analytics.invoke({}))
    print(f"   Total Catalog Products:     {analytics['total_products']}")
    print(f"   Average Price:              ₹{analytics['average_price_inr']:,}")
    print(f"   Inventory Breakdown:        {analytics['inventory_breakdown']}")
    print(f"   Total Est. Catalog Revenue: ₹{analytics['financial_aggregates']['total_estimated_revenue_inr']:,}")
    print(f"   Total Est. Catalog Profit:  ₹{analytics['financial_aggregates']['total_estimated_profit_inr']:,}")

    # 6. Natural Language Agent Query
    print("\n🤖 [6] Autonomous LangChain Agent Natural Language Query:")
    query_prompt = "What is the battery life of the SonicPulse earbuds and how much does it cost?"
    print(f"   User Prompt: '{query_prompt}'")
    agent_out = run_langchain_product_agent(query_prompt)
    print(f"\n   Agent Answer:\n   {agent_out['answer']}")
    print(f"   Tools Invoked: {[t['tool'] for t in agent_out['tools_invoked']]}")

    print("\n" + "=" * 70)
    print("✅ LangChain Product Engine executed with 0 errors!")
    print("=" * 70)

if __name__ == "__main__":
    main()
