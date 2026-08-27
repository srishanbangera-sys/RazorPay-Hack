from fastapi import APIRouter
from app.api.products import router as products_router
from app.api.mandates import router as mandates_router
from app.api.checkout import router as checkout_router
from app.api.audit import router as audit_router
from app.api.explain import router as explain_router
from app.api.payments import router as payments_router
from app.api.agent import router as agent_router

api_router = APIRouter()
api_router.include_router(products_router)
api_router.include_router(mandates_router)
api_router.include_router(checkout_router)
api_router.include_router(audit_router)
api_router.include_router(explain_router)
api_router.include_router(payments_router)
api_router.include_router(agent_router)

__all__ = ["api_router"]
