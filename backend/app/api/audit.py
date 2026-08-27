from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.audit import AuditEventResponse, AuditEventListResponse
from app.services.audit_service import AuditService

router = APIRouter(prefix="/audit", tags=["Audit"])

@router.get("", response_model=AuditEventListResponse)
def get_audit_trail(
    trace_id: Optional[str] = Query(None, description="Filter by transaction trace ID"),
    order_id: Optional[str] = Query(None, description="Filter by order ID"),
    actor: Optional[str] = Query(None, description="Filter by actor (buyer, agent, backend, mandate_engine, payment)"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    events = AuditService.get_events(
        db=db,
        trace_id=trace_id,
        order_id=order_id,
        actor=actor,
        event_type=event_type,
        limit=limit,
        offset=offset
    )
    return AuditEventListResponse(
        items=[AuditEventResponse.model_validate(e) for e in events],
        total=len(events)
    )

@router.get("/{event_id}", response_model=AuditEventResponse)
def get_audit_event(event_id: str, db: Session = Depends(get_db)):
    event = AuditService.get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Audit event not found")
    return AuditEventResponse.model_validate(event)
