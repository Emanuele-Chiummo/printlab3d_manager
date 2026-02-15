from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.api_v1.deps import get_db, get_current_user, require_roles
from app.models.job import Job, JobConsumption, JobStatus
from app.models.quote import QuoteVersion, QuoteStatus
from app.models.user import User, UserRole
from app.schemas.job import JobCreateFromQuote, JobOut, JobUpdate, JobConsumptionCreate
from app.services.audit import log_action
from app.services.jobs import recalc_job, create_job_cost_entries
from app.models.costs import CostEntry

router = APIRouter()


def job_to_out(job: Job) -> JobOut:
    """Helper per convertire Job in JobOut con quote_code popolato"""
    job_dict = JobOut.model_validate(job).model_dump()
    job_dict["quote_code"] = job.quote_version.quote.codice if job.quote_version and job.quote_version.quote else ""
    return JobOut(**job_dict)


@router.get("/", response_model=list[JobOut])
def list_jobs(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    jobs = db.query(Job).options(joinedload(Job.quote_version).joinedload(QuoteVersion.quote)).order_by(Job.id.desc()).all()
    return [job_to_out(job) for job in jobs]


@router.post("/from-quote", response_model=JobOut, dependencies=[Depends(require_roles(UserRole.admin, UserRole.operator))])
def create_from_quote(payload: JobCreateFromQuote, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    from app.models.quote import QuoteLine  # Import per joinedload
    
    # Carica QuoteVersion con le righe (eager loading)
    qv = db.query(QuoteVersion).options(
        joinedload(QuoteVersion.righe),
        joinedload(QuoteVersion.quote)
    ).filter(QuoteVersion.id == payload.quote_version_id).first()
    
    if not qv:
        raise HTTPException(status_code=404, detail="Versione preventivo non trovata")
    if qv.status != QuoteStatus.ACCETTATO:
        raise HTTPException(status_code=400, detail="Il preventivo deve essere ACCETTATO per creare un Job")
    
    # Calcola valori stimati dal preventivo
    # Nel preventivo tempo_stimato_min è già PER PEZZO
    # Per il job prendiamo il PRIMO tempo_stimato_min come riferimento
    tempo_per_pezzo_min = qv.righe[0].tempo_stimato_min if qv.righe else 0
    
    # Calcola energia per pezzo basandoci sui parametri del preventivo
    tempo_ore_per_pezzo = tempo_per_pezzo_min / 60.0
    energia_per_pezzo_kwh = (float(qv.potenza_w) / 1000.0) * tempo_ore_per_pezzo
    
    # Quantità totale del preventivo
    quantita_totale = sum(line.quantita for line in qv.righe) if qv.righe else 1
    
    # Crea job con valori PER PEZZO pre-popolati
    job = Job(
        quote_version_id=qv.id,
        quantita_prodotta=quantita_totale,  # Pre-popola con quantità totale del preventivo
        tempo_reale_min=tempo_per_pezzo_min,  # Pre-popola con tempo PER PEZZO
        energia_kwh=energia_per_pezzo_kwh,   # Pre-popola con energia PER PEZZO
        scarti_g=0,
        note="",
    )
    job.created_by_id = current.id
    job.updated_by_id = current.id
    db.add(job)
    db.flush()  # Flush per ottenere job.id prima di aggiungere consumi
    
    # Copia i consumi materiali dal preventivo
    for line in qv.righe:
        if line.filament_id and line.peso_materiale_g > 0:
            cons = JobConsumption(
                job_id=job.id,
                filament_id=line.filament_id,
                peso_g=int(line.peso_materiale_g * line.quantita),  # Moltiplica per quantità
            )
            cons.created_by_id = current.id
            cons.updated_by_id = current.id
            db.add(cons)
    
    # Ricalcola costi e margini
    recalc_job(db, job)
    
    db.commit()
    db.refresh(job)
    log_action(db, current.id, "Job", job.id, "CREATE")
    db.commit()
    # Eager load per popolare quote_code
    db.refresh(job)
    job = db.query(Job).options(joinedload(Job.quote_version).joinedload(QuoteVersion.quote)).filter(Job.id == job.id).first()
    return job_to_out(job)


@router.put("/{job_id}", response_model=JobOut, dependencies=[Depends(require_roles(UserRole.admin, UserRole.operator))])
def update_job(job_id: int, payload: JobUpdate, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    job = db.query(Job).options(joinedload(Job.quote_version).joinedload(QuoteVersion.quote)).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job non trovato")
    
    # Salva lo status precedente per verificare se cambia
    old_status = job.status
    
    for k, v in payload.model_dump(exclude_unset=True).items():
        # convert enum objects to their string value before assignment so the
        # database column remains a plain VARCHAR
        if k == "status" and isinstance(v, JobStatus):
            v = v.value
        setattr(job, k, v)
    job.updated_by_id = current.id
    recalc_job(db, job)
    
    # Se il job è appena stato completato, crea le voci di costo
    if old_status != JobStatus.completato.value and job.status == JobStatus.completato.value:
        create_job_cost_entries(db, job, current.id)
    
    db.commit()
    db.refresh(job)
    log_action(db, current.id, "Job", job.id, "UPDATE")
    db.commit()
    return job_to_out(job)


@router.post("/{job_id}/consumi", response_model=JobOut, dependencies=[Depends(require_roles(UserRole.admin, UserRole.operator))])
def add_consumption(job_id: int, payload: JobConsumptionCreate, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    job = db.query(Job).options(joinedload(Job.quote_version).joinedload(QuoteVersion.quote)).filter(Job.id == job_id).first()
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
    return job_to_out(job)


@router.delete("/{job_id}", dependencies=[Depends(require_roles(UserRole.admin, UserRole.operator))])
def delete_job(job_id: int, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job non trovato")
    
    # Scollega le voci di costo dal job prima di cancellarlo
    db.query(CostEntry).filter(CostEntry.job_id == job_id).update({"job_id": None})
    
    log_action(db, current.id, "Job", job.id, "DELETE")
    db.delete(job)
    db.commit()
    return {"ok": True}
