from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class AuditEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    trace_id: str
    timestamp: datetime
    actor: str
    event_type: str
    action: str
    decision: str
    reason_code: Optional[str] = None
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    order_id: Optional[str] = None
    payment_id: Optional[str] = None

class AuditEventListResponse(BaseModel):
    items: List[AuditEventResponse]
    total: int
