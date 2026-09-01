"""
LangChain LLM Factory with Multi-Provider Support and Deterministic Fallback.
Supports Google Gemini, OpenAI, Anthropic, and Offline Deterministic Execution.
"""

import os
import logging
from typing import Optional, Any, List
# pyrefly: ignore [missing-import]
from langchain_core.language_models.chat_models import BaseChatModel
# pyrefly: ignore [missing-import]
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage
# pyrefly: ignore [missing-import]
from langchain_core.outputs import ChatResult, ChatGeneration

from app.core.config import settings

logger = logging.getLogger(__name__)

class DeterministicFallbackChatModel(BaseChatModel):
    """
    High-reliability offline LangChain Chat Model that deterministically answers product queries
    and invokes catalog retrieval tools without requiring active cloud API credits.
    """
    model_name: str = "deterministic-catalog-engine-v1"
    bound_tools: List[Any] = []

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[Any] = None,
        **kwargs: Any,
    ) -> ChatResult:
        # Extract last user message
        last_human_msg = ""
        for m in reversed(messages):
            if isinstance(m, HumanMessage):
                last_human_msg = m.content
                break
            elif isinstance(m, dict) and m.get("role") == "user":
                last_human_msg = m.get("content", "")
                break

        query = str(last_human_msg) if last_human_msg else "product inquiry"
        
        # Execute tool-like search locally
        from app.langchain_module.tools import search_products_semantic, fetch_product_details_by_id
        import json

        # Check if looking for specific ID (e.g. prod_001)
        import re
        id_match = re.search(r"\b(prod_\d{3})\b", query, re.IGNORECASE)
        
        if id_match:
            pid = id_match.group(1).lower()
            tool_res_str = fetch_product_details_by_id.invoke({"product_id": pid})
            res_dict = json.loads(tool_res_str)
            if res_dict.get("status") == "success":
                p = res_dict["product"]
                content = (
                    f"### 📦 Product Details: {p['name']} ({p['id']})\n\n"
                    f"- **Brand**: {p['brand']}\n"
                    f"- **Category**: {p['category']} ({p['product_type']})\n"
                    f"- **Price**: ₹{p['price']:,} (Cost: ₹{p.get('cost_price', 'N/A')})\n"
                    f"- **Stock**: {p['stock']} units ({p['stock_status']})\n"
                    f"- **Rating**: ⭐ {p['rating']} / 5.0 (Sales: {p['sales_count']} units, Views: {p['views']})\n"
                    f"- **Specification**: {p['specification']}\n"
                    f"- **Color / Options**: {p['color']} | {p['sizes_or_capacity']}\n"
                    f"- **Estimated Profit**: ₹{p.get('estimated_profit', 0):,} (Margin: {p.get('margin_percentage', 'N/A')}%)\n\n"
                    f"**Description**: {p['description']}"
                )
            else:
                content = f"Product `{pid}` was not found in the catalog."
        else:
            tool_res_str = search_products_semantic.invoke({"query": query, "limit": 4})
            res_dict = json.loads(tool_res_str)
            products = res_dict.get("products", [])
            if products:
                lines = [f"Found **{len(products)}** matching products from the catalog:\n"]
                for i, p in enumerate(products, 1):
                    lines.append(
                        f"{i}. **{p['name']}** (`{p['id']}`) - **₹{p['price']:,}** | ⭐ {p['rating']} | {p['brand']} ({p['category']})\n"
                        f"   - *Specs*: {p['specification']} | *Stock*: {p['stock']} units ({p['stock_status']})\n"
                        f"   - *Description*: {p['description']}"
                    )
                content = "\n".join(lines)
            else:
                content = f"I searched the merchant catalog for '{query}', but found no matching products."

        message = AIMessage(content=content)
        generation = ChatGeneration(message=message)
        return ChatResult(generations=[generation])

    @property
    def _llm_type(self) -> str:
        return "deterministic-catalog-model"

    def bind_tools(self, tools: Any, **kwargs: Any) -> Any:
        self.bound_tools = tools
        return self

class ResilientChatModel(BaseChatModel):
    """
    Wraps an external LLM (Gemini, OpenAI, Anthropic) and gracefully catches any API error
    (such as RateLimitError / 429 quota exhaustion, auth errors, network timeouts)
    and transparently falls back to the deterministic local catalog reasoning engine.
    """
    primary_model: Optional[BaseChatModel] = None
    fallback_model: DeterministicFallbackChatModel = DeterministicFallbackChatModel()

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[Any] = None,
        **kwargs: Any,
    ) -> ChatResult:
        if self.primary_model:
            try:
                return self.primary_model._generate(messages, stop=stop, run_manager=run_manager, **kwargs)
            except Exception as exc:
                logger.warning(f"Primary LLM failed ({exc.__class__.__name__}: {exc}). Activating deterministic fallback.")
        
        return self.fallback_model._generate(messages, stop=stop, run_manager=run_manager, **kwargs)

    @property
    def _llm_type(self) -> str:
        if self.primary_model:
            return f"resilient-{self.primary_model._llm_type}"
        return "resilient-deterministic-model"

    def bind_tools(self, tools: Any, **kwargs: Any) -> Any:
        bound_primary = None
        if self.primary_model and hasattr(self.primary_model, "bind_tools"):
            try:
                bound_primary = self.primary_model.bind_tools(tools, **kwargs)
            except Exception:
                bound_primary = self.primary_model
        bound_fallback = self.fallback_model.bind_tools(tools, **kwargs)
        return ResilientChatModel(primary_model=bound_primary, fallback_model=bound_fallback)

def get_chat_model(
    temperature: float = 0.0,
    preferred_provider: Optional[str] = None
) -> BaseChatModel:
    """
    Returns a highly reliable LangChain ChatModel instance.
    Checks Google GenAI, OpenAI, Anthropic keys and wraps them in ResilientChatModel.
    """
    google_key = settings.GOOGLE_API_KEY or os.environ.get("GOOGLE_API_KEY")
    openai_key = settings.OPENAI_API_KEY or os.environ.get("OPENAI_API_KEY")
    anthropic_key = settings.ANTHROPIC_API_KEY or os.environ.get("ANTHROPIC_API_KEY")

    # 1. Google Gemini (if requested or key present)
    if (preferred_provider == "google" or not preferred_provider) and google_key and not google_key.startswith("sk-"):
        try:
            # pyrefly: ignore [missing-import]
            from langchain_google_genai import ChatGoogleGenerativeAI
            gemini_model = ChatGoogleGenerativeAI(
                model="gemini-2.5-flash",
                google_api_key=google_key,
                temperature=temperature
            )
            return ResilientChatModel(primary_model=gemini_model)
        except Exception:
            pass

    # 2. OpenAI
    if (preferred_provider == "openai" or not preferred_provider) and openai_key and openai_key.startswith("sk-"):
        try:
            # pyrefly: ignore [missing-import]
            from langchain_openai import ChatOpenAI
            openai_model = ChatOpenAI(
                model="gpt-4o-mini",
                api_key=openai_key,
                temperature=temperature
            )
            return ResilientChatModel(primary_model=openai_model)
        except Exception:
            pass

    # 3. Anthropic
    if (preferred_provider == "anthropic" or not preferred_provider) and anthropic_key and anthropic_key.startswith("sk-ant-"):
        try:
            # pyrefly: ignore [missing-import]
            from langchain_anthropic import ChatAnthropic
            anthropic_model = ChatAnthropic(
                model="claude-3-5-sonnet-20241022",
                api_key=anthropic_key,
                temperature=temperature
            )
            return ResilientChatModel(primary_model=anthropic_model)
        except Exception:
            pass

    # 4. Pure Deterministic Model
    return DeterministicFallbackChatModel()
