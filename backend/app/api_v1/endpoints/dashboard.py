from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.api_v1.deps import get_db, get_current_user
from app.models.inventory import Filament
from app.models.job import Job, JobStatus
from app.models.quote import QuoteVersion
from app.models.user import User
from app.schemas.dashboard import DashboardKPI

router = APIRouter()


@router.get("/kpi", response_model=DashboardKPI)
def kpi(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    if now.month == 12:
        next_month = datetime(now.year + 1, 1, 1)
    else:
        next_month = datetime(now.year, now.month + 1, 1)

    preventivi_mese = db.query(QuoteVersion).filter(and_(QuoteVersion.created_at >= month_start, QuoteVersion.created_at < next_month)).count()
    job_in_corso = db.query(Job).filter(Job.status == JobStatus.in_corso.value).count()
    stock_basso = db.query(Filament).filter(Filament.peso_residuo_g <= Filament.soglia_min_g).count()

    jobs = db.query(Job).filter(Job.status == JobStatus.completato.value).limit(50).all()
    ratios = []
    for j in jobs:
        qv = db.get(QuoteVersion, j.quote_version_id)
        if qv and float(qv.totale_imponibile_eur) > 0:
            ratios.append(float(j.margine_eur) / float(qv.totale_imponibile_eur) * 100)
    margine_medio = sum(ratios) / len(ratios) if ratios else 0.0

    return DashboardKPI(
        preventivi_mese=preventivi_mese,
        job_in_corso=job_in_corso,
        stock_basso=stock_basso,
        margine_medio_pct=round(margine_medio, 2),
    )
