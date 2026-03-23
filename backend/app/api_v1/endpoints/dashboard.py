from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import and_, func
from sqlalchemy.orm import Session, joinedload

from app.api_v1.deps import get_db, get_current_user
from app.models.costs import CostEntry
from app.models.customer import Customer
from app.models.inventory import Filament
from app.models.job import Job, JobStatus
from app.models.quote import Quote, QuoteVersion, QuoteStatus
from app.models.user import User
from app.schemas.dashboard import DashboardKPI, DashboardTrends, TrendPoint

router = APIRouter()


@router.get("/kpi", response_model=DashboardKPI)
def kpi(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    if now.month == 12:
        next_month = datetime(now.year + 1, 1, 1)
    else:
        next_month = datetime(now.year, now.month + 1, 1)

    # KPI esistenti
    preventivi_mese = db.query(QuoteVersion).filter(and_(QuoteVersion.created_at >= month_start, QuoteVersion.created_at < next_month)).count()
    job_in_corso = db.query(Job).filter(Job.status == JobStatus.in_corso.value).count()
    stock_basso = db.query(Filament).filter(Filament.peso_residuo_g <= Filament.soglia_min_g).count()

    jobs = db.query(Job).options(joinedload(Job.quote_version)).filter(Job.status == JobStatus.completato.value).limit(50).all()
    ratios = []
    for j in jobs:
        qv = j.quote_version
        if qv and float(qv.totale_imponibile_eur) > 0:
            ratios.append(float(j.margine_eur) / float(qv.totale_imponibile_eur) * 100)
    margine_medio = sum(ratios) / len(ratios) if ratios else 0.0

    # Nuovi KPI finanziari
    # Ricavi: preventivi ACCETTATO del mese
    ricavi = db.query(func.sum(QuoteVersion.totale_imponibile_eur)).filter(
        and_(
            QuoteVersion.status == QuoteStatus.ACCETTATO,
            QuoteVersion.created_at >= month_start,
            QuoteVersion.created_at < next_month
        )
    ).scalar() or 0.0

    # Costi: somma cost_entries del periodo YYYY-MM
    periodo_corrente = now.strftime("%Y-%m")
    costi = db.query(func.sum(CostEntry.importo_eur)).filter(
        CostEntry.periodo_yyyymm == periodo_corrente
    ).scalar() or 0.0

    # Utile
    utile = float(ricavi) - float(costi)

    # Clienti attivi: clienti con preventivi creati nel mese
    quote_ids_this_month = db.query(QuoteVersion.quote_id).filter(
        and_(
            QuoteVersion.created_at >= month_start,
            QuoteVersion.created_at < next_month
        )
    ).distinct().subquery()
    
    clienti_attivi = db.query(Quote.customer_id).filter(
        Quote.id.in_(quote_ids_this_month)
    ).distinct().count()

    return DashboardKPI(
        preventivi_mese=preventivi_mese,
        job_in_corso=job_in_corso,
        stock_basso=stock_basso,
        margine_medio_pct=round(margine_medio, 2),
        ricavi_mese_eur=round(float(ricavi), 2),
        costi_mese_eur=round(float(costi), 2),
        utile_mese_eur=round(utile, 2),
        clienti_attivi=clienti_attivi,
    )


@router.get("/trends", response_model=DashboardTrends)
def trends(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    """Ultimi 6 mesi: ricavi (preventivi accettati), costi (cost_entries) e job completati."""
    now = datetime.utcnow()

    # Genera la lista degli ultimi 6 periodi YYYY-MM (incluso il mese corrente)
    periods: list[str] = []
    year, month = now.year, now.month
    for _ in range(6):
        periods.insert(0, f"{year}-{month:02d}")
        month -= 1
        if month == 0:
            month = 12
            year -= 1

    # Ricavi per periodo: somma totale_imponibile_eur dei preventivi ACCETTATI
    # Usiamo created_at troncato a YYYY-MM per il raggruppamento
    ricavi_rows = (
        db.query(
            func.to_char(QuoteVersion.created_at, "YYYY-MM").label("periodo"),
            func.coalesce(func.sum(QuoteVersion.totale_imponibile_eur), 0).label("totale"),
        )
        .filter(QuoteVersion.status == QuoteStatus.ACCETTATO)
        .group_by(func.to_char(QuoteVersion.created_at, "YYYY-MM"))
        .all()
    )
    ricavi_map = {r.periodo: float(r.totale) for r in ricavi_rows}

    # Costi per periodo
    costi_rows = (
        db.query(
            CostEntry.periodo_yyyymm.label("periodo"),
            func.coalesce(func.sum(CostEntry.importo_eur), 0).label("totale"),
        )
        .group_by(CostEntry.periodo_yyyymm)
        .all()
    )
    costi_map = {r.periodo: float(r.totale) for r in costi_rows}

    # Job completati per periodo (basato su created_at)
    jobs_rows = (
        db.query(
            func.to_char(Job.created_at, "YYYY-MM").label("periodo"),
            func.count(Job.id).label("totale"),
        )
        .filter(Job.status == JobStatus.completato.value)
        .group_by(func.to_char(Job.created_at, "YYYY-MM"))
        .all()
    )
    jobs_map = {r.periodo: int(r.totale) for r in jobs_rows}

    points = [
        TrendPoint(
            periodo=p,
            ricavi=round(ricavi_map.get(p, 0.0), 2),
            costi=round(costi_map.get(p, 0.0), 2),
            job_completati=jobs_map.get(p, 0),
        )
        for p in periods
    ]

    return DashboardTrends(points=points)
