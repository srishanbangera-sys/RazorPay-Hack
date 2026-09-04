from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class MandateBase(BaseModel):
    merchant_id: str = "merchant_demo"
    max_amount: int = Field(..., description="Maximum allowed cart total in INR")
    allowed_categories: List[str] = Field(default_factory=list)
    max_items_per_order: int = Field(default=1)
    expires_at: datetime
    status: str = Field(default="active")

class MandateCreate(MandateBase):
    id: Optional[str] = None

class MandateUpdate(BaseModel):
    max_amount: Optional[int] = None
    allowed_categories: Optional[List[str]] = None
    max_items_per_order: Optional[int] = None
    expires_at: Optional[datetime] = None
    status: Optional[str] = None

class MandateResponse(MandateBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: Optional[datetime] = None

class MandateListResponse(BaseModel):
    items: List[MandateResponse]
    total: int

class MandateStateResponse(BaseModel):
    id: str
    merchant_id: str
    max_amount: int
    spent_amount: int
    available_amount: int
    allowed_categories: List[str]
    max_items_per_order: int
    expires_at: datetime
    time_remaining_formatted: str
    time_remaining_seconds: int
    status: str
    is_active: bool
    payment_source: str = "Operations wallet • 8042"
    currency_symbol: str = "$"

