from datetime import datetime

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.costs import CostCategory, CostEntry
from app.models.customer import Customer
from app.models.inventory import Filament
from app.models.job import Job, JobConsumption, JobStatus
from app.models.location import Location
from app.models.quote import Quote, QuoteLine, QuoteStatus, QuoteVersion
from app.models.user import User, UserRole
from app.services.jobs import recalc_job
from app.services.quotes import recalc_quote_version


def seed_if_empty(db: Session) -> None:
    return

    # Users
    admin = User(
        email=settings.ADMIN_EMAIL,
        full_name="Admin",
        # explicitly use value so we get a string regardless of model
        role=UserRole.admin.value,
        hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
    )
    oper = User(
        email="operatore@printlab.local",
        full_name="Operatore",
        role=UserRole.operator.value,
        hashed_password=get_password_hash("operatore123"),
    )
    sales = User(
        email="commerciale@printlab.local",
        full_name="Commerciale",
        role=UserRole.sales.value,
        hashed_password=get_password_hash("commerciale123"),
    )
    viewer = User(
        email="viewer@printlab.local",
        full_name="Viewer",
        role=UserRole.viewer.value,
        hashed_password=get_password_hash("viewer123"),
    )
    db.add_all([admin, oper, sales, viewer])
    db.commit()

    # Locations tree: Magazzino > Scaffale > Ripiano > Slot
    mag = Location(nome="Magazzino", tipo="MAGAZZINO")
    sca = Location(nome="Scaffale A", tipo="SCAFFALE", parent=mag)
    rip = Location(nome="Ripiano 1", tipo="RIPIANO", parent=sca)
    slot = Location(nome="Slot 1", tipo="SLOT", parent=rip)
    for l in [mag, sca, rip, slot]:
        l.created_by_id = admin.id
        l.updated_by_id = admin.id
    db.add(mag)
    db.commit()
    db.refresh(slot)

    # Filaments
    f1 = Filament(
        materiale="PLA",
        marca="Sunlu",
        colore="Bianco",
        diametro_mm=1.75,
        costo_spool_eur=12.50,
        peso_nominale_g=1000,
        peso_residuo_g=850,
        soglia_min_g=150,
        ubicazione_id=slot.id,
    )
    f2 = Filament(
        materiale="PLA+",
        marca="eSUN",
        colore="Bone White",
        diametro_mm=1.75,
        costo_spool_eur=14.90,
        peso_nominale_g=1000,
        peso_residuo_g=120,
        soglia_min_g=200,
        ubicazione_id=slot.id,
    )
    for f in [f1, f2]:
        f.created_by_id = admin.id
        f.updated_by_id = admin.id
    db.add_all([f1, f2])
    db.commit()

    # Customers
    c1 = Customer(
        tipo_cliente="DITTA",
        ragione_sociale="Vineria Demo",
        piva="IT12345678901",
        email="info@vineria.local",
        telefono="+39 000 000 000",
        indirizzo="Roma",
        note="Cliente demo ditta"
    )
    c2 = Customer(
        tipo_cliente="PERSONA",
        nome="Mario",
        cognome="Rossi",
        codice_fiscale="RSSMRA80A01H501U",
        email="mario.rossi@email.local",
        telefono="+39 222 222 222",
        indirizzo="Torino",
        note="Cliente demo persona"
    )
    for c in [c1, c2]:
        c.created_by_id = admin.id
        c.updated_by_id = admin.id
    db.add_all([c1, c2])
    db.commit()
    db.refresh(c1)
    db.refresh(c2)

    # Quote 1 (bozza)
    q1 = Quote(codice="PRV-0001", customer_id=c1.id, note="Preventivo demo (bozza)")
    q1.created_by_id = admin.id
    q1.updated_by_id = admin.id
    db.add(q1)
    db.commit()
    db.refresh(q1)

    q1v1 = QuoteVersion(quote_id=q1.id, version_number=1, status=QuoteStatus.bozza)
    q1v1.created_by_id = admin.id
    q1v1.updated_by_id = admin.id
    q1v1.righe.append(
        QuoteLine(descrizione="Sottobicchiere personalizzato", filament_id=f1.id, peso_materiale_g=17, tempo_stimato_min=60)
    )
    db.add(q1v1)
    recalc_quote_version(db, q1v1)
    db.commit()

    # Quote 2 (accettato) -> Job
    q2 = Quote(codice="PRV-0002", customer_id=c2.id, note="Preventivo demo (accettato)")
    q2.created_by_id = admin.id
    q2.updated_by_id = admin.id
    db.add(q2)
    db.commit()
    db.refresh(q2)

    q2v1 = QuoteVersion(quote_id=q2.id, version_number=1, status=QuoteStatus.accettato)
    q2v1.created_by_id = admin.id
    q2v1.updated_by_id = admin.id
    q2v1.costo_macchina_eur_h = 6.0
    q2v1.costo_manodopera_eur_h = 18.0
    q2v1.overhead_pct = 10.0
    q2v1.margine_pct = 25.0
    q2v1.sconto_eur = 2.0
    q2v1.iva_pct = 22.0
    q2v1.righe.append(QuoteLine(descrizione="Portachiavi personalizzato", filament_id=f2.id, peso_materiale_g=30, tempo_stimato_min=90))
    q2v1.righe.append(QuoteLine(descrizione="Packaging", filament_id=None, peso_materiale_g=0, tempo_stimato_min=15, costo_extra_eur=2.0))
    db.add(q2v1)
    recalc_quote_version(db, q2v1)
    db.commit()
    db.refresh(q2v1)

    # Job from accepted quote version
    job = Job(quote_version_id=q2v1.id, status=JobStatus.in_corso.value)
    job.created_by_id = oper.id
    job.updated_by_id = oper.id
    job.tempo_reale_min = 95
    job.energia_kwh = 0.45
    job.scarti_g = 3
    job.note = "Job demo in corso"
    job.consumi.append(JobConsumption(filament_id=f2.id, peso_g=33))
    db.add(job)
    db.commit()
    db.refresh(job)
    recalc_job(db, job)
    db.commit()

    # Cost categories
    cat_names = [
        ("Energia", "Costi energia elettrica"),
        ("Manutenzione", "Ricambi/ugelli"),
        ("Ammortamento", "Quota ammortamento stampanti"),
        ("Spedizioni", "Imballo e spedizioni"),
        ("Generali", "Costi generali"),
    ]
    cats: list[CostCategory] = []
    for n, d in cat_names:
        cc = CostCategory(nome=n, descrizione=d)
        cc.created_by_id = admin.id
        cc.updated_by_id = admin.id
        cats.append(cc)
    db.add_all(cats)
    db.commit()

    # Costs entries: some linked to job
    month = datetime.now().strftime("%Y-%m")
    def _cat(nome: str) -> CostCategory:
        return next(c for c in cats if c.nome == nome)

    entries = [
        CostEntry(categoria_id=_cat("Energia").id, importo_eur=3.50, periodo_yyyymm=month, job_id=job.id, note="Consumo stampante"),
        CostEntry(categoria_id=_cat("Manutenzione").id, importo_eur=12.00, periodo_yyyymm=month, job_id=None, note="Nozzle 0.4"),
        CostEntry(categoria_id=_cat("Spedizioni").id, importo_eur=6.90, periodo_yyyymm=month, job_id=job.id, note="Corriere"),
        CostEntry(categoria_id=_cat("Generali").id, importo_eur=20.00, periodo_yyyymm=month, job_id=None, note="Varie"),
    ]
    for e in entries:
        e.created_by_id = admin.id
        e.updated_by_id = admin.id
    db.add_all(entries)
    db.commit()
