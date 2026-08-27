from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: int = Field(..., description="Price in INR")
    stock: int = Field(default=0, description="Available inventory")
    category: str
    attributes: Optional[Dict[str, Any]] = Field(default_factory=dict)

class ProductCreate(ProductBase):
    id: Optional[str] = None

class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: Optional[datetime] = None

class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
