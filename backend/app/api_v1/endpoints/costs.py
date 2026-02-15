from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api_v1.deps import get_db, get_current_user, require_roles
from app.models.costs import CostCategory, CostEntry
from app.models.customer import Customer
from app.models.job import Job
from app.models.quote import QuoteVersion, Quote
from app.models.user import User, UserRole
from app.schemas.costs import (
  CostCategoryCreate,
  CostCategoryOut,
  CostEntryCreate,
  CostEntryOut,
  MonthlyCostReportItem,
  CostByJobReportItem,
  CostByCustomerReportItem,
)
from app.services.audit import log_action

router = APIRouter()


@router.get("/categories", response_model=list[CostCategoryOut])
def list_categories(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(CostCategory).order_by(CostCategory.nome).all()


@router.post(
    "/categories",
    response_model=CostCategoryOut,
    dependencies=[Depends(require_roles(UserRole.admin))],
)
def create_category(payload: CostCategoryCreate, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    c = CostCategory(**payload.model_dump())
    c.created_by_id = current.id
    c.updated_by_id = current.id
    db.add(c)
    db.commit()
    db.refresh(c)
    log_action(db, current.id, "CostCategory", c.id, "CREATE")
    db.commit()
    return c


@router.get("/entries", response_model=list[CostEntryOut])
def list_entries(
    periodo_from: str | None = Query(default=None, description="YYYY-MM"),
    periodo_to: str | None = Query(default=None, description="YYYY-MM"),
    categoria_id: int | None = None,
    job_id: int | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    q = db.query(CostEntry)
    if periodo_from:
        q = q.filter(CostEntry.periodo_yyyymm >= periodo_from)
    if periodo_to:
        q = q.filter(CostEntry.periodo_yyyymm <= periodo_to)
    if categoria_id:
        q = q.filter(CostEntry.categoria_id == categoria_id)
    if job_id:
        q = q.filter(CostEntry.job_id == job_id)
    return q.order_by(CostEntry.id.desc()).limit(1000).all()


@router.post(
    "/entries",
    response_model=CostEntryOut,
    dependencies=[Depends(require_roles(UserRole.admin, UserRole.operator))],
)
def create_entry(payload: CostEntryCreate, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    e = CostEntry(**payload.model_dump())
    e.created_by_id = current.id
    e.updated_by_id = current.id
    db.add(e)
    db.commit()
    db.refresh(e)
    log_action(db, current.id, "CostEntry", e.id, "CREATE")
    db.commit()
    return e


@router.delete(
    "/entries/{entry_id}",
    dependencies=[Depends(require_roles(UserRole.admin, UserRole.operator))],
)
def delete_entry(entry_id: int, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    entry = db.get(CostEntry, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Costo non trovato")
    log_action(db, current.id, "CostEntry", entry.id, "DELETE")
    db.delete(entry)
    db.commit()
    return {"ok": True}


@router.get("/reports/monthly", response_model=list[MonthlyCostReportItem])
def report_monthly(
    periodo_from: str | None = Query(default=None, description="YYYY-MM"),
    periodo_to: str | None = Query(default=None, description="YYYY-MM"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    q = db.query(CostEntry.periodo_yyyymm, func.coalesce(func.sum(CostEntry.importo_eur), 0).label("totale"))
    if periodo_from:
        q = q.filter(CostEntry.periodo_yyyymm >= periodo_from)
    if periodo_to:
        q = q.filter(CostEntry.periodo_yyyymm <= periodo_to)
    q = q.group_by(CostEntry.periodo_yyyymm).order_by(CostEntry.periodo_yyyymm)
    return [{"periodo_yyyymm": r[0], "totale_eur": float(r[1] or 0)} for r in q.all()]


@router.get("/reports/by-job", response_model=list[CostByJobReportItem])
def report_by_job(
    periodo_from: str | None = Query(default=None, description="YYYY-MM"),
    periodo_to: str | None = Query(default=None, description="YYYY-MM"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    q = (
        db.query(
            CostEntry.job_id,
            Quote.codice.label("quote_codice"),
            Customer.ragione_sociale.label("customer"),
            CostEntry.periodo_yyyymm,
            func.coalesce(func.sum(CostEntry.importo_eur), 0).label("totale"),
        )
        .join(Job, Job.id == CostEntry.job_id)
        .join(QuoteVersion, QuoteVersion.id == Job.quote_version_id)
        .join(Quote, Quote.id == QuoteVersion.quote_id)
        .join(Customer, Customer.id == Quote.customer_id)
        .filter(CostEntry.job_id.isnot(None))
    )
    if periodo_from:
        q = q.filter(CostEntry.periodo_yyyymm >= periodo_from)
    if periodo_to:
        q = q.filter(CostEntry.periodo_yyyymm <= periodo_to)
    q = q.group_by(CostEntry.job_id, Quote.codice, Customer.ragione_sociale, CostEntry.periodo_yyyymm)
    q = q.order_by(CostEntry.periodo_yyyymm.desc())
    return [
        {
            "job_id": int(r.job_id),
            "quote_codice": r.quote_codice,
            "customer": r.customer,
            "periodo_yyyymm": r.periodo_yyyymm,
            "totale_eur": float(r.totale or 0),
        }
        for r in q.all()
    ]


@router.get("/reports/by-customer", response_model=list[CostByCustomerReportItem])
def report_by_customer(
    periodo_from: str | None = Query(default=None, description="YYYY-MM"),
    periodo_to: str | None = Query(default=None, description="YYYY-MM"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    q = (
        db.query(
            Customer.id.label("customer_id"),
            Customer.ragione_sociale.label("customer"),
            func.coalesce(func.sum(CostEntry.importo_eur), 0).label("totale"),
        )
        .join(Quote, Quote.customer_id == Customer.id)
        .join(QuoteVersion, QuoteVersion.quote_id == Quote.id)
        .join(Job, Job.quote_version_id == QuoteVersion.id)
        .join(CostEntry, CostEntry.job_id == Job.id)
    )
    if periodo_from:
        q = q.filter(CostEntry.periodo_yyyymm >= periodo_from)
    if periodo_to:
        q = q.filter(CostEntry.periodo_yyyymm <= periodo_to)
    q = q.group_by(Customer.id, Customer.ragione_sociale).order_by(func.sum(CostEntry.importo_eur).desc())
    return [{"customer_id": int(r.customer_id), "customer": r.customer, "totale_eur": float(r.totale or 0)} for r in q.all()]
