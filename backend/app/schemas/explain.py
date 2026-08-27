from typing import Optional, Dict, Any
from pydantic import BaseModel

class ExplainResponse(BaseModel):
    action_id: str
    decision: str
    code: str
    explanation: str
    details: Dict[str, Any]
