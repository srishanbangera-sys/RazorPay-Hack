from typing import List, Optional
import uuid
from sqlalchemy.orm import Session
from app.models.mandate import Mandate
from app.schemas.mandate import MandateCreate, MandateUpdate
from app.mandate_engine.models import MandateData

class MandateService:
    @staticmethod
    def get_mandate_by_id(db: Session, mandate_id: str) -> Optional[Mandate]:
        return db.query(Mandate).filter(Mandate.id == mandate_id).first()

    @staticmethod
    def get_default_active_mandate(db: Session) -> Optional[Mandate]:
        mandate = db.query(Mandate).filter(Mandate.status == "active").first()
        if not mandate:
            mandate = db.query(Mandate).first()
        return mandate

    @staticmethod
    def list_mandates(db: Session, limit: int = 50, offset: int = 0) -> List[Mandate]:
        return db.query(Mandate).order_by(Mandate.created_at.desc()).offset(offset).limit(limit).all()

    @staticmethod
    def create_mandate(db: Session, mandate_in: MandateCreate) -> Mandate:
        mandate = Mandate(
            id=mandate_in.id or f"mandate_{uuid.uuid4().hex[:8]}",
            merchant_id=mandate_in.merchant_id,
            max_amount=mandate_in.max_amount,
            allowed_categories=mandate_in.allowed_categories,
            max_items_per_order=mandate_in.max_items_per_order,
            expires_at=mandate_in.expires_at,
            status=mandate_in.status
        )
        db.add(mandate)
        db.commit()
        db.refresh(mandate)
        return mandate

    @staticmethod
    def update_mandate(db: Session, mandate_id: str, mandate_update: MandateUpdate) -> Optional[Mandate]:
        mandate = db.query(Mandate).filter(Mandate.id == mandate_id).first()
        if not mandate:
            return None
            
        update_data = mandate_update.model_dump(exclude_unset=True)
        for field, val in update_data.items():
            setattr(mandate, field, val)
            
        db.commit()
        db.refresh(mandate)
        return mandate

    @staticmethod
    def to_engine_data(mandate: Mandate) -> MandateData:
        return MandateData(
            id=mandate.id,
            merchant_id=mandate.merchant_id,
            max_amount=mandate.max_amount,
            allowed_categories=mandate.allowed_categories,
            max_items_per_order=mandate.max_items_per_order,
            expires_at=mandate.expires_at,
            status=mandate.status
        )
