from decimal import Decimal
from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from app.models.inventory import Filament
from app.models.job import Job, JobStatus
from app.models.quote import QuoteVersion
from app.models.costs import CostCategory, CostEntry


def recalc_job(db: Session, job: Job) -> None:
    # Carica QuoteVersion con eager loading delle righe
    qv = db.query(QuoteVersion).options(joinedload(QuoteVersion.righe)).filter(QuoteVersion.id == job.quote_version_id).first()
    if not qv:
        raise HTTPException(status_code=404, detail="Versione preventivo non trovata")

    # Calcola quantità totale preventivo per calcolare proporzioni
    quantita_preventivo = sum(line.quantita for line in qv.righe) if qv.righe else 1
    
    # Proporzione prodotta rispetto al preventivo
    if quantita_preventivo > 0:
        proporzione = Decimal(str(job.quantita_prodotta or 1)) / Decimal(str(quantita_preventivo))
    else:
        proporzione = Decimal("1")

    # Quantità prodotta per moltiplicare i valori per pezzo
    qty = Decimal(str(job.quantita_prodotta or 1))

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

    # Tempo ed energia sono PER PEZZO, vanno moltiplicati per quantità
    tempo_totale_min = Decimal(str(job.tempo_reale_min or 0)) * qty
    hours = tempo_totale_min / Decimal("60")
    
    energia_totale_kwh = Decimal(str(job.energia_kwh or 0)) * qty
    costo_energia = energia_totale_kwh * Decimal(str(qv.costo_energia_kwh))
    
    costo_macchina = hours * Decimal(str(qv.costo_macchina_eur_h))
    # La manodopera nel preventivo è inserita come minuti totali (non per pezzo).
    manodopera_totale_prev = Decimal(str(sum((line.ore_manodopera_min or 0) for line in qv.righe)))
    if quantita_preventivo > 0:
        manodopera_per_pezzo_min = manodopera_totale_prev / Decimal(str(quantita_preventivo))
    else:
        manodopera_per_pezzo_min = manodopera_totale_prev
    manodopera_totale_min = manodopera_per_pezzo_min * qty
    labor_hours = manodopera_totale_min / Decimal("60")
    costo_manodopera = labor_hours * Decimal(str(qv.costo_manodopera_eur_h))
    consumabili = Decimal(str(qv.consumabili_fissi_eur or 0)) * qty  # Moltiplicato per quantity come nel preventivo

    # Costi diretti totali (come nel preventivo)
    costi_diretti = mat + costo_energia + costo_macchina + costo_manodopera + consumabili
    
    # Overhead e rischio (come nel preventivo)
    overhead = costi_diretti * Decimal(str(qv.overhead_pct or 0)) / Decimal("100")
    rischio = costi_diretti * Decimal(str(qv.rischio_pct or 0)) / Decimal("100")
    
    costo_finale = costi_diretti + overhead + rischio

    # ricavo proporzionale = totale imponibile * proporzione prodotta
    ricavo_totale = Decimal(str(qv.totale_imponibile_eur))
    ricavo = ricavo_totale * proporzione
    margine = ricavo - costo_finale

    job.costo_finale_eur = float(costo_finale.quantize(Decimal("0.01")))
    job.margine_eur = float(margine.quantize(Decimal("0.01")))


def create_job_cost_entries(db: Session, job: Job, user_id: int) -> None:
    """
    Crea le voci di costo quando un job viene completato.
    Registra i costi reali di produzione come voci nella tabella cost_entries.
    """
    # Verifica se esistono già costi per questo job
    existing = db.query(CostEntry).filter(CostEntry.job_id == job.id).first()
    if existing:
        # Già esistono costi per questo job, non creare duplicati
        return
    
    # Carica QuoteVersion per i parametri di costo
    qv = db.query(QuoteVersion).options(joinedload(QuoteVersion.righe)).filter(QuoteVersion.id == job.quote_version_id).first()
    if not qv:
        return
    
    # Periodo corrente (formato YYYY-MM)
    periodo = datetime.now().strftime("%Y-%m")
    
    # Helper per ottenere o creare una categoria
    def get_or_create_category(nome: str, descrizione: str) -> CostCategory:
        cat = db.query(CostCategory).filter(CostCategory.nome == nome).first()
        if not cat:
            cat = CostCategory(nome=nome, descrizione=descrizione)
            cat.created_by_id = user_id
            cat.updated_by_id = user_id
            db.add(cat)
            db.flush()
        return cat
    
    # Quantità prodotta
    qty = Decimal(str(job.quantita_prodotta or 1))
    quantita_preventivo = Decimal(str(sum((line.quantita or 0) for line in qv.righe))) if qv.righe else Decimal("1")
    
    entries = []
    
    # 1. Costo materiali (filamenti consumati)
    costo_materiali = Decimal("0")
    for cons in job.consumi:
        fil = db.get(Filament, cons.filament_id)
        if not fil:
            continue
        costo_spool = Decimal(str(fil.costo_spool_eur))
        denom = Decimal(str(fil.peso_nominale_g or 1000))
        costo_per_g = (costo_spool / denom) if denom != 0 else Decimal("0")
        costo_materiali += costo_per_g * Decimal(str(cons.peso_g or 0))
    
    if costo_materiali > 0:
        cat_mat = get_or_create_category("Materiali", "Filamenti e materiali di stampa")
        entry = CostEntry(
            categoria_id=cat_mat.id,
            importo_eur=float(costo_materiali.quantize(Decimal("0.01"))),
            periodo_yyyymm=periodo,
            job_id=job.id,
            note=f"Materiali job #{job.id}"
        )
        entry.created_by_id = user_id
        entry.updated_by_id = user_id
        entries.append(entry)
    
    # 2. Costo energia
    tempo_totale_min = Decimal(str(job.tempo_reale_min or 0)) * qty
    energia_totale_kwh = Decimal(str(job.energia_kwh or 0)) * qty
    
    # Recupera costo energia dalle impostazioni (se disponibile) o usa quello del preventivo
    from app.db import settings as db_settings
    try:
        settings = db_settings.get_settings(db)
        costo_kwh = Decimal(str(settings.costo_kwh_eur))
    except:
        costo_kwh = Decimal(str(qv.costo_energia_kwh))
    
    costo_energia = energia_totale_kwh * costo_kwh
    
    if costo_energia > 0:
        cat_energia = get_or_create_category("Energia", "Costi energia elettrica")
        entry = CostEntry(
            categoria_id=cat_energia.id,
            importo_eur=float(costo_energia.quantize(Decimal("0.01"))),
            periodo_yyyymm=periodo,
            job_id=job.id,
            note=f"Energia job #{job.id} ({float(energia_totale_kwh.quantize(Decimal('0.01')))} kWh)"
        )
        entry.created_by_id = user_id
        entry.updated_by_id = user_id
        entries.append(entry)
    
    # 3. Costo manodopera proporzionato alla quantità prodotta
    manodopera_totale_prev = Decimal(str(sum((line.ore_manodopera_min or 0) for line in qv.righe)))
    if quantita_preventivo > 0:
        manodopera_per_pezzo_min = manodopera_totale_prev / quantita_preventivo
    else:
        manodopera_per_pezzo_min = manodopera_totale_prev
    manodopera_totale_min = manodopera_per_pezzo_min * qty
    labor_hours = manodopera_totale_min / Decimal("60")
    costo_manodopera = labor_hours * Decimal(str(qv.costo_manodopera_eur_h))
    hours = tempo_totale_min / Decimal("60")

    if costo_manodopera > 0:
        cat_manodopera = get_or_create_category("Manodopera", "Costi del lavoro")
        entry = CostEntry(
            categoria_id=cat_manodopera.id,
            importo_eur=float(costo_manodopera.quantize(Decimal("0.01"))),
            periodo_yyyymm=periodo,
            job_id=job.id,
            note=f"Manodopera job #{job.id} ({float(labor_hours.quantize(Decimal('0.1')))}h)"
        )
        entry.created_by_id = user_id
        entry.updated_by_id = user_id
        entries.append(entry)
    
    # 4. Costo macchina (ammortamento)
    costo_macchina = hours * Decimal(str(qv.costo_macchina_eur_h))
    
    if costo_macchina > 0:
        cat_macchina = get_or_create_category("Ammortamento", "Quota ammortamento stampanti")
        entry = CostEntry(
            categoria_id=cat_macchina.id,
            importo_eur=float(costo_macchina.quantize(Decimal("0.01"))),
            periodo_yyyymm=periodo,
            job_id=job.id,
            note=f"Uso macchina job #{job.id} ({float(hours.quantize(Decimal('0.1')))}h)"
        )
        entry.created_by_id = user_id
        entry.updated_by_id = user_id
        entries.append(entry)
    
    # 5. Consumabili fissi (moltiplicati per quantità)
    consumabili = Decimal(str(qv.consumabili_fissi_eur or 0)) * qty
    
    if consumabili > 0:
        cat_cons = get_or_create_category("Consumabili", "Consumabili di stampa")
        entry = CostEntry(
            categoria_id=cat_cons.id,
            importo_eur=float(consumabili.quantize(Decimal("0.01"))),
            periodo_yyyymm=periodo,
            job_id=job.id,
            note=f"Consumabili job #{job.id} (qty: {int(qty)})"
        )
        entry.created_by_id = user_id
        entry.updated_by_id = user_id
        entries.append(entry)
    
    # 6. Overhead e rischio (calcolato come percentuale sui costi base)
    base = costo_materiali + costo_macchina + costo_manodopera + costo_energia + consumabili
    overhead = base * Decimal(str(qv.overhead_pct)) / Decimal("100")
    rischio = base * Decimal(str(qv.rischio_pct or 0)) / Decimal("100")
    
    if overhead > 0:
        cat_overhead = get_or_create_category("Generali", "Costi generali")
        entry = CostEntry(
            categoria_id=cat_overhead.id,
            importo_eur=float(overhead.quantize(Decimal("0.01"))),
            periodo_yyyymm=periodo,
            job_id=job.id,
            note=f"Overhead job #{job.id} ({qv.overhead_pct}%)"
        )
        entry.created_by_id = user_id
        entry.updated_by_id = user_id
        entries.append(entry)
    
    if rischio > 0:
        cat_rischio = get_or_create_category("Rischio", "Fattore di rischio")
        entry = CostEntry(
            categoria_id=cat_rischio.id,
            importo_eur=float(rischio.quantize(Decimal("0.01"))),
            periodo_yyyymm=periodo,
            job_id=job.id,
            note=f"Rischio job #{job.id} ({qv.rischio_pct or 0}%)"
        )
        entry.created_by_id = user_id
        entry.updated_by_id = user_id
        entries.append(entry)
    
    # Aggiungi tutte le voci al database
    db.add_all(entries)

