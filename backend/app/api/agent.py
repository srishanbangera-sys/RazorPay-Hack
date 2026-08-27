from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.agent import AgentChatRequest, AgentChatResponse
from app.services.agent_service import AgentService

router = APIRouter(prefix="/agent", tags=["Agent"])

@router.post("/chat", response_model=AgentChatResponse)
def agent_chat(
    request: AgentChatRequest,
    db: Session = Depends(get_db)
):
    """
    AI Shopping Agent interaction endpoint.
    Translates buyer natural language request into controlled backend tool calls,
    proposes carts, evaluates mandate boundaries, and returns structured audit results.
    """
    return AgentService.process_chat(db=db, request=request)
