from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.mandate import MandateResponse, MandateListResponse, MandateCreate, MandateUpdate
from app.services.mandate_service import MandateService

router = APIRouter(prefix="/mandates", tags=["Mandates"])

@router.get("", response_model=MandateListResponse)
def list_mandates(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    mandates = MandateService.list_mandates(db=db, limit=limit, offset=offset)
    return MandateListResponse(
        items=[MandateResponse.model_validate(m) for m in mandates],
        total=len(mandates)
    )

@router.get("/active", response_model=MandateResponse)
def get_active_mandate(db: Session = Depends(get_db)):
    mandate = MandateService.get_default_active_mandate(db)
    if not mandate:
        raise HTTPException(status_code=404, detail="No active mandate found")
    return MandateResponse.model_validate(mandate)

@router.get("/{mandate_id}", response_model=MandateResponse)
def get_mandate(mandate_id: str, db: Session = Depends(get_db)):
    mandate = MandateService.get_mandate_by_id(db, mandate_id)
    if not mandate:
        raise HTTPException(status_code=404, detail="Mandate not found")
    return MandateResponse.model_validate(mandate)

@router.post("", response_model=MandateResponse, status_code=201)
def create_mandate(mandate_in: MandateCreate, db: Session = Depends(get_db)):
    mandate = MandateService.create_mandate(db, mandate_in)
    return MandateResponse.model_validate(mandate)

@router.patch("/{mandate_id}", response_model=MandateResponse)
def update_mandate(mandate_id: str, mandate_update: MandateUpdate, db: Session = Depends(get_db)):
    mandate = MandateService.update_mandate(db, mandate_id, mandate_update)
    if not mandate:
        raise HTTPException(status_code=404, detail="Mandate not found")
    return MandateResponse.model_validate(mandate)
