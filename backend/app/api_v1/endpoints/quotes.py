from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.api_v1.deps import get_db, get_current_user, require_roles
from app.models.quote import Quote, QuoteLine, QuoteVersion, QuoteStatus
from app.models.user import User, UserRole
from app.schemas.quote import QuoteCreate, QuoteOut, QuoteVersionCreate, QuoteVersionOut, QuoteVersionUpdate
from app.services.audit import log_action
from app.services.quotes import recalc_quote_version
from app.services.pdf import render_quote_pdf

router = APIRouter()


@router.get("/", response_model=list[QuoteOut])
def list_quotes(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Quote).order_by(Quote.id.desc()).all()


@router.post("/", response_model=QuoteOut, dependencies=[Depends(require_roles(UserRole.admin, UserRole.sales, UserRole.operator))])
def create_quote(payload: QuoteCreate, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    if db.query(Quote).filter(Quote.codice == payload.codice).first():
        raise HTTPException(status_code=400, detail="Codice preventivo già esistente")
    q = Quote(**payload.model_dump())
    q.created_by_id = current.id
    q.updated_by_id = current.id
    db.add(q)
    db.commit()
    db.refresh(q)
    log_action(db, current.id, "Quote", q.id, "CREATE")
    db.commit()
    return q


@router.get("/{quote_id}/versions", response_model=list[QuoteVersionOut])
def list_versions(quote_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    q = db.get(Quote, quote_id)
    if not q:
        raise HTTPException(status_code=404, detail="Preventivo non trovato")
    return q.versions


@router.post("/{quote_id}/versions", response_model=QuoteVersionOut, dependencies=[Depends(require_roles(UserRole.admin, UserRole.sales, UserRole.operator))])
def create_version(quote_id: int, payload: QuoteVersionCreate, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    q = db.get(Quote, quote_id)
    if not q:
        raise HTTPException(status_code=404, detail="Preventivo non trovato")
    next_v = (max([v.version_number for v in q.versions]) + 1) if q.versions else 1
    qv = QuoteVersion(
        quote_id=quote_id,
        version_number=next_v,
        costo_macchina_eur_h=payload.costo_macchina_eur_h,
        costo_manodopera_eur_h=payload.costo_manodopera_eur_h,
        overhead_pct=payload.overhead_pct,
        margine_pct=payload.margine_pct,
        sconto_eur=payload.sconto_eur,
        iva_pct=payload.iva_pct,
    )
    qv.created_by_id = current.id
    qv.updated_by_id = current.id
    for line_in in payload.righe:
        qv.righe.append(QuoteLine(**line_in.model_dump()))
    db.add(qv)
    recalc_quote_version(db, qv)
    db.commit()
    db.refresh(qv)
    log_action(db, current.id, "QuoteVersion", qv.id, "CREATE")
    db.commit()
    return qv


@router.put("/versions/{version_id}", response_model=QuoteVersionOut, dependencies=[Depends(require_roles(UserRole.admin, UserRole.sales, UserRole.operator))])
def update_version(version_id: int, payload: QuoteVersionUpdate, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    qv = db.get(QuoteVersion, version_id)
    if not qv:
        raise HTTPException(status_code=404, detail="Versione non trovata")
    data = payload.model_dump(exclude_unset=True)
    righe = data.pop("righe", None)
    for k, v in data.items():
        setattr(qv, k, v)
    if righe is not None:
        qv.righe.clear()
        for line_in in righe:
            qv.righe.append(QuoteLine(**line_in.model_dump()))
    qv.updated_by_id = current.id
    recalc_quote_version(db, qv)
    db.commit()
    db.refresh(qv)
    log_action(db, current.id, "QuoteVersion", qv.id, "UPDATE")
    db.commit()
    return qv


@router.get("/versions/{version_id}/pdf")
def download_pdf(version_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    qv = db.get(QuoteVersion, version_id)
    if not qv:
        raise HTTPException(status_code=404, detail="Versione non trovata")
    quote = db.get(Quote, qv.quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Preventivo non trovato")
    # eager load customer
    _ = quote.customer
    pdf_bytes, filename = render_quote_pdf(quote, qv)
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={filename}"})


@router.post("/versions/{version_id}/set-status", response_model=QuoteVersionOut, dependencies=[Depends(require_roles(UserRole.admin, UserRole.sales, UserRole.operator))])
def set_status(version_id: int, status_in: QuoteStatus, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    qv = db.get(QuoteVersion, version_id)
    if not qv:
        raise HTTPException(status_code=404, detail="Versione non trovata")
    qv.status = status_in
    qv.updated_by_id = current.id
    db.commit()
    db.refresh(qv)
    log_action(db, current.id, "QuoteVersion", qv.id, "STATUS", details=str(status_in))
    db.commit()
    return qv
