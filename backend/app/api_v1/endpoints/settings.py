
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db import settings as db_settings
from pydantic import BaseModel

router = APIRouter()

class PreventivoSettings(BaseModel):
    costo_kwh_eur: float
    costo_manodopera_eur_h: float
    margine_pct: float
    overhead_pct: float
    fattore_rischio_pct: float
    consumabili_eur_stampa: float
    soglia_filamento_basso_g: float
    company_name: str
    company_address: str
    company_email: str
    company_phone: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get('/preventivo', response_model=PreventivoSettings)
def get_preventivo_settings(db: Session = Depends(get_db)):
    s = db_settings.get_settings(db)
    return PreventivoSettings(
        costo_kwh_eur=s.costo_kwh_eur,
        costo_manodopera_eur_h=s.costo_manodopera_eur_h,
        margine_pct=s.margine_pct,
        overhead_pct=s.overhead_pct,
        fattore_rischio_pct=s.fattore_rischio_pct,
        consumabili_eur_stampa=s.consumabili_eur_stampa,
        soglia_filamento_basso_g=s.soglia_filamento_basso_g,
        company_name=s.company_name,
        company_address=s.company_address,
        company_email=s.company_email,
        company_phone=s.company_phone
    )

@router.post('/preventivo', response_model=PreventivoSettings)
def set_preventivo_settings(data: PreventivoSettings, db: Session = Depends(get_db)):
    s = db_settings.update_settings(db, data.dict())
    return PreventivoSettings(
        costo_kwh_eur=s.costo_kwh_eur,
        costo_manodopera_eur_h=s.costo_manodopera_eur_h,
        margine_pct=s.margine_pct,
        overhead_pct=s.overhead_pct,
        fattore_rischio_pct=s.fattore_rischio_pct,
        consumabili_eur_stampa=s.consumabili_eur_stampa,
        soglia_filamento_basso_g=s.soglia_filamento_basso_g,
        company_name=s.company_name,
        company_address=s.company_address,
        company_email=s.company_email,
        company_phone=s.company_phone
    )
