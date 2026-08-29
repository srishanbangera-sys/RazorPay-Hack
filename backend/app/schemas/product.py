from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    brand: Optional[str] = None
    description: Optional[str] = None
    price: int = Field(..., description="Price in INR")
    cost_price: Optional[int] = Field(default=None, description="Cost price in INR")
    stock: int = Field(default=0, description="Available inventory")
    category: str
    product_type: Optional[str] = None
    rating: Optional[float] = Field(default=0.0, description="Customer rating out of 5")
    sales_count: Optional[int] = Field(default=0, description="Historical units sold")
    views: Optional[int] = Field(default=0, description="Total views")
    conversion_rate: Optional[float] = Field(default=0.0, description="Conversion rate")
    color: Optional[str] = None
    sizes_or_capacity: Optional[str] = None
    specification: Optional[str] = None
    profit_per_unit: Optional[int] = None
    estimated_revenue: Optional[int] = None
    estimated_profit: Optional[int] = None
    stock_status: Optional[str] = Field(default="in_stock", description="in_stock, low_stock, or out_of_stock")
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

class ProductLangChainQueryRequest(BaseModel):
    query: str = Field(..., description="Natural language product query, search, or comparison request")
    category: Optional[str] = Field(default=None, description="Optional category filter")
    max_price: Optional[int] = Field(default=None, description="Optional maximum price filter")
    min_rating: Optional[float] = Field(default=None, description="Optional minimum rating filter")
    in_stock_only: Optional[bool] = Field(default=False, description="Filter only in-stock items")
    brand: Optional[str] = Field(default=None, description="Optional brand filter")
    conversation_id: Optional[str] = Field(default=None)

class ProductLangChainQueryResponse(BaseModel):
    query: str
    answer: str
    products: List[ProductResponse] = Field(default_factory=list)
    tools_used: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
