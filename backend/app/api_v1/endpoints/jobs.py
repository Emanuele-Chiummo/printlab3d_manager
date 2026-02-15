from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api_v1.deps import get_db, get_current_user, require_roles
from app.models.job import Job, JobConsumption, JobStatus
from app.models.quote import QuoteVersion, QuoteStatus
from app.models.user import User, UserRole
from app.schemas.job import JobCreateFromQuote, JobOut, JobUpdate, JobConsumptionCreate
from app.services.audit import log_action
from app.services.jobs import recalc_job

router = APIRouter()


@router.get("/", response_model=list[JobOut])
def list_jobs(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Job).order_by(Job.id.desc()).all()


@router.post("/from-quote", response_model=JobOut, dependencies=[Depends(require_roles(UserRole.admin, UserRole.operator))])
def create_from_quote(payload: JobCreateFromQuote, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    qv = db.get(QuoteVersion, payload.quote_version_id)
    if not qv:
        raise HTTPException(status_code=404, detail="Versione preventivo non trovata")
    if qv.status != QuoteStatus.ACCETTATO:
        raise HTTPException(status_code=400, detail="Il preventivo deve essere ACCETTATO per creare un Job")
    job = Job(quote_version_id=qv.id)
    job.created_by_id = current.id
    job.updated_by_id = current.id
    db.add(job)
    db.commit()
    db.refresh(job)
    log_action(db, current.id, "Job", job.id, "CREATE")
    db.commit()
    return job


@router.put("/{job_id}", response_model=JobOut, dependencies=[Depends(require_roles(UserRole.admin, UserRole.operator))])
def update_job(job_id: int, payload: JobUpdate, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job non trovato")
    for k, v in payload.model_dump(exclude_unset=True).items():
        # convert enum objects to their string value before assignment so the
        # database column remains a plain VARCHAR
        if k == "status" and isinstance(v, JobStatus):
            v = v.value
        setattr(job, k, v)
    job.updated_by_id = current.id
    recalc_job(db, job)
    db.commit()
    db.refresh(job)
    log_action(db, current.id, "Job", job.id, "UPDATE")
    db.commit()
    return job


@router.post("/{job_id}/consumi", response_model=JobOut, dependencies=[Depends(require_roles(UserRole.admin, UserRole.operator))])
def add_consumption(job_id: int, payload: JobConsumptionCreate, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job non trovato")
    cons = JobConsumption(job_id=job_id, filament_id=payload.filament_id, peso_g=payload.peso_g)
    cons.created_by_id = current.id
    cons.updated_by_id = current.id
    db.add(cons)
    job.updated_by_id = current.id
    recalc_job(db, job)
    db.commit()
    db.refresh(job)
    log_action(db, current.id, "Job", job.id, "UPDATE", details="aggiunto consumo")
    db.commit()
    return job
