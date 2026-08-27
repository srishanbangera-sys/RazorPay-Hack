from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
import uuid
import json
from sqlalchemy.orm import Session
from app.models.audit import AuditEvent

SENSITIVE_KEYS = {"api_key", "secret", "card_number", "cvv", "password", "token", "key_secret"}

def sanitize_payload(data: Any) -> Any:
    """Recursively sanitize sensitive fields from audit payloads."""
    if isinstance(data, dict):
        sanitized = {}
        for k, v in data.items():
            if any(sensitive in k.lower() for sensitive in SENSITIVE_KEYS):
                sanitized[k] = "[REDACTED]"
            else:
                sanitized[k] = sanitize_payload(v)
        return sanitized
    elif isinstance(data, list):
        return [sanitize_payload(item) for item in data]
    return data

class AuditService:
    @staticmethod
    def log_event(
        db: Session,
        trace_id: str,
        actor: str,
        event_type: str,
        action: str,
        decision: str,
        reason_code: Optional[str] = None,
        input_data: Optional[Dict[str, Any]] = None,
        output_data: Optional[Dict[str, Any]] = None,
        order_id: Optional[str] = None,
        payment_id: Optional[str] = None
    ) -> AuditEvent:
        """
        Append-only event logger. Never updates or deletes existing historical records.
        """
        event = AuditEvent(
            id=f"audit_{uuid.uuid4().hex[:12]}",
            trace_id=trace_id,
            timestamp=datetime.now(timezone.utc),
            actor=actor,
            event_type=event_type,
            action=action,
            decision=decision,
            reason_code=reason_code,
            input_data=sanitize_payload(input_data) if input_data else None,
            output_data=sanitize_payload(output_data) if output_data else None,
            order_id=order_id,
            payment_id=payment_id
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

    @staticmethod
    def get_events(
        db: Session,
        trace_id: Optional[str] = None,
        order_id: Optional[str] = None,
        actor: Optional[str] = None,
        event_type: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[AuditEvent]:
        query = db.query(AuditEvent)
        if trace_id:
            query = query.filter(AuditEvent.trace_id == trace_id)
        if order_id:
            query = query.filter(AuditEvent.order_id == order_id)
        if actor:
            query = query.filter(AuditEvent.actor == actor)
        if event_type:
            query = query.filter(AuditEvent.event_type == event_type)
            
        return query.order_by(AuditEvent.timestamp.asc()).offset(offset).limit(limit).all()

    @staticmethod
    def get_event_by_id(db: Session, event_id: str) -> Optional[AuditEvent]:
        return db.query(AuditEvent).filter(AuditEvent.id == event_id).first()
