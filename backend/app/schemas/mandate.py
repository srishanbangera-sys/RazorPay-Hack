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
