from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.explain import ExplainResponse
from app.services.explain_service import ExplainService

router = APIRouter(prefix="/explain", tags=["Explainability"])

@router.get("/{action_id}", response_model=ExplainResponse)
def explain_action(action_id: str, db: Session = Depends(get_db)):
    """
    Returns structured, human-readable explanations of why an action was approved or rejected.
    """
    return ExplainService.explain_action(db=db, action_id=action_id)
