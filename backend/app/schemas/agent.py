from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.product import ProductResponse
from app.schemas.checkout import CartItemDetail

class AgentChatRequest(BaseModel):
    message: str
    mandate_id: str = "mandate_demo"
    conversation_id: Optional[str] = "conv_demo"
    trace_id: Optional[str] = None

class ToolCallRecord(BaseModel):
    tool: str
    input: Dict[str, Any]
    output: Dict[str, Any]

class AgentChatResponse(BaseModel):
    message: str
    conversation_id: str
    trace_id: str
    tools_invoked: List[ToolCallRecord] = Field(default_factory=list)
    products_considered: List[ProductResponse] = Field(default_factory=list)
    proposed_cart: List[CartItemDetail] = Field(default_factory=list)
    cart_total: Optional[int] = None
    mandate_decision: Optional[Dict[str, Any]] = None
    order_id: Optional[str] = None
    alternative_product: Optional[ProductResponse] = None
