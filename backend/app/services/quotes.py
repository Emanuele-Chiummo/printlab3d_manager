from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.inventory import Filament
from app.models.quote import QuoteLine, QuoteVersion


def recalc_quote_version(db: Session, qv: QuoteVersion) -> None:
    # Recupera parametri stampante se associata
    printer = None
    if qv.printer_id:
        from app.models.printer import Printer
        printer = db.get(Printer, qv.printer_id)
    # fallback ai parametri versione se non c'è stampante
    def get_param(attr, default):
        if printer and hasattr(printer, attr):
            val = getattr(printer, attr)
            if val is not None:
                return Decimal(str(val))
        return Decimal(str(getattr(qv, attr, default) or default))

    tot = Decimal("0")
    for line in qv.righe:
        # materiale
        mat_cost = Decimal("0")
        if line.filament_id:
            filament = db.get(Filament, line.filament_id)
            if not filament:
                raise HTTPException(status_code=404, detail="Filamento non trovato")
            costo_spool = Decimal(str(filament.costo_spool_eur))
            denom = Decimal(str(filament.peso_nominale_g or 1000))
            costo_per_g = (costo_spool / denom) if denom != 0 else Decimal("0")
            mat_cost = costo_per_g * Decimal(str(line.peso_materiale_g or 0))
        line.costo_materiale_eur = float(mat_cost.quantize(Decimal("0.01")))

        hours = Decimal(str(line.tempo_stimato_min or 0)) / Decimal("60")
        # energia
        potenza_w = get_param('potenza_w', 0)
        costo_energia_kwh = get_param('costo_energia_kwh', 0)
        energia_kwh = (potenza_w / Decimal("1000")) * hours
        energia_cost = energia_kwh * costo_energia_kwh

        # macchina/usura
        costo_macchina_eur_h = get_param('costo_macchina_eur_h', 0)
        costo_macchina = hours * costo_macchina_eur_h

        # manodopera
        costo_manodopera_eur_h = get_param('costo_manodopera_eur_h', 0)
        costo_manodopera = hours * costo_manodopera_eur_h

        # consumabili
        consumabili_fissi_eur = get_param('consumabili_fissi_eur', 0)

        # somma costi diretti
        subtotale_diretti = mat_cost + energia_cost + costo_macchina + costo_manodopera + consumabili_fissi_eur

        # overhead e rischio
        overhead_pct = get_param('overhead_pct', 0)
        rischio_pct = get_param('rischio_pct', 0)
        overhead = subtotale_diretti * overhead_pct / Decimal("100")
        rischio = subtotale_diretti * rischio_pct / Decimal("100")

        # costo totale netto
        costo_totale_netto = subtotale_diretti + overhead + rischio

        # margine
        margine_pct = get_param('margine_pct', 0)
        prezzo_netto = costo_totale_netto * (Decimal("1") + margine_pct / Decimal("100"))

        # sconto
        sconto_eur = get_param('sconto_eur', 0)
        prezzo_netto_scontato = prezzo_netto - sconto_eur
        if prezzo_netto_scontato < 0:
            prezzo_netto_scontato = Decimal("0")

        # iva
        iva_pct = get_param('iva_pct', 0)
        prezzo_ivato = prezzo_netto_scontato * (Decimal("1") + iva_pct / Decimal("100"))

        # Salva breakdown su riga (opzionale, puoi aggiungere altri campi se vuoi)
        line.costo_macchina_eur = float(costo_macchina.quantize(Decimal("0.01")))
        line.costo_manodopera_eur = float(costo_manodopera.quantize(Decimal("0.01")))
        # puoi aggiungere line.costo_energia_eur = float(energia_cost.quantize(Decimal("0.01"))) se hai il campo
        line.totale_riga_eur = float(prezzo_ivato.quantize(Decimal("0.01")))
        tot += prezzo_ivato

    qv.totale_imponibile_eur = float(tot.quantize(Decimal("0.01")))
    qv.totale_iva_eur = 0  # già inclusa in prezzo_ivato per ogni riga
    qv.totale_lordo_eur = float(tot.quantize(Decimal("0.01")))
