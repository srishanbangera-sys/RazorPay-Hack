from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str = "Agent-Transactable Merchant"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    
    DATABASE_URL: str = Field(default="sqlite:///./agent_merchant.db")
    
    # Razorpay Test Mode
    RAZORPAY_KEY_ID: Optional[str] = Field(default=None)
    RAZORPAY_KEY_SECRET: Optional[str] = Field(default=None)
    RAZORPAY_WEBHOOK_SECRET: Optional[str] = Field(default=None)
    
    # LLM Providers
    OPENAI_API_KEY: Optional[str] = Field(default=None)
    ANTHROPIC_API_KEY: Optional[str] = Field(default=None)
    
    # Merchant Details
    MERCHANT_ID: str = Field(default="merchant_demo")
    MERCHANT_NAME: str = Field(default="Apex Athletics & Gear")
    
    CORS_ORIGINS: List[str] = ["*"]

settings = Settings()
