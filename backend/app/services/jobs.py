from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.inventory import Filament
from app.models.job import Job
from app.models.quote import QuoteVersion


def recalc_job(db: Session, job: Job) -> None:
    qv = db.get(QuoteVersion, job.quote_version_id)
    if not qv:
        raise HTTPException(status_code=404, detail="Versione preventivo non trovata")

    # costo materiale reale
    mat = Decimal("0")
    for cons in job.consumi:
        fil = db.get(Filament, cons.filament_id)
        if not fil:
            continue
        costo_spool = Decimal(str(fil.costo_spool_eur))
        denom = Decimal(str(fil.peso_nominale_g or 1000))
        costo_per_g = (costo_spool / denom) if denom != 0 else Decimal("0")
        mat += costo_per_g * Decimal(str(cons.peso_g or 0))

    hours = Decimal(str(job.tempo_reale_min or 0)) / Decimal("60")
    costo_macchina = hours * Decimal(str(qv.costo_macchina_eur_h))
    costo_manodopera = hours * Decimal(str(qv.costo_manodopera_eur_h))
    base = mat + costo_macchina + costo_manodopera
    overhead = base * Decimal(str(qv.overhead_pct)) / Decimal("100")
    costo_finale = base + overhead

    # ricavo stimato = totale imponibile (senza iva)
    ricavo = Decimal(str(qv.totale_imponibile_eur))
    margine = ricavo - costo_finale

    job.costo_finale_eur = float(costo_finale.quantize(Decimal("0.01")))
    job.margine_eur = float(margine.quantize(Decimal("0.01")))
