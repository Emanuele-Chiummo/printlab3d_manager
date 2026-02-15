from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.inventory import Filament
from app.models.quote import QuoteLine, QuoteVersion


def recalc_quote_version(db: Session, qv: QuoteVersion) -> None:
    # Recupera parametri da QuoteVersion
    # (i parametri sono già nella versione, non più dalla stampante rimossa)
    
    # Somma totali per riga prima dello sconto
    tot_imponibile = Decimal("0")
    tot_iva = Decimal("0")
    
    for idx, line in enumerate(qv.righe):
        # Quantità (default 1)
        qty = Decimal(str(line.quantita or 1))
        
        # Prima riga? (per calcolare costi macchina/energia solo su questa)
        is_first = (idx == 0)
        
        # 1. COSTO MATERIALE (per singolo pezzo)
        mat_cost = Decimal("0")
        if line.filament_id:
            filament = db.get(Filament, line.filament_id)
            if not filament:
                raise HTTPException(status_code=404, detail="Filamento non trovato")
            costo_spool = Decimal(str(filament.costo_spool_eur))
            denom = Decimal(str(filament.peso_nominale_g or 1000))
            costo_per_g = (costo_spool / denom) if denom != 0 else Decimal("0")
            mat_cost = costo_per_g * Decimal(str(line.peso_materiale_g or 0))
        line.costo_materiale_eur = float((mat_cost * qty).quantize(Decimal("0.01")))

        # Ore di stampa (per singolo pezzo)
        print_hours = Decimal(str(line.tempo_stimato_min or 0)) / Decimal("60")
        
        # Ore di manodopera (inserite dall'utente, se 0 non conta)
        labor_hours = Decimal(str(line.ore_manodopera_min or 0)) / Decimal("60")

        # 2. COSTO ENERGIA = (potenza_w/1000) * print_hours * costo_energia_kwh * qty (SOLO PRIMA RIGA)
        if is_first:
            potenza_w = Decimal(str(qv.potenza_w or 200))
            costo_energia_kwh = Decimal(str(qv.costo_energia_kwh or 0.15))
            energia_kwh = (potenza_w / Decimal("1000")) * print_hours
            energia_cost = energia_kwh * costo_energia_kwh
            line.costo_energia_eur = float((energia_cost * qty).quantize(Decimal("0.01")))
        else:
            energia_cost = Decimal("0")
            line.costo_energia_eur = 0.0

        # 3. COSTO MACCHINA/USURA = print_hours * costo_macchina_eur_h * qty (SOLO PRIMA RIGA)
        if is_first:
            costo_macchina_eur_h = Decimal(str(qv.costo_macchina_eur_h or 0.08))
            costo_macchina = print_hours * costo_macchina_eur_h
            line.costo_macchina_eur = float((costo_macchina * qty).quantize(Decimal("0.01")))
        else:
            costo_macchina = Decimal("0")
            line.costo_macchina_eur = 0.0

        # 4. COSTO MANODOPERA = labor_hours * costo_manodopera_eur_h (non moltiplicato per qty)
        costo_manodopera_eur_h = Decimal(str(qv.costo_manodopera_eur_h or 0))
        costo_manodopera = labor_hours * costo_manodopera_eur_h
        line.costo_manodopera_eur = float(costo_manodopera.quantize(Decimal("0.01")))

        # 5. COSTO CONSUMABILI = consumabili_fissi_eur * qty
        consumabili_fissi_eur = Decimal(str(qv.consumabili_fissi_eur or 0))
        line.costo_consumabili_eur = float((consumabili_fissi_eur * qty).quantize(Decimal("0.01")))

        # 6. SUBTOTALE COSTI DIRETTI (già moltiplicati per qty tranne manodopera)
        subtotale_diretti = (mat_cost * qty) + (energia_cost * qty) + (costo_macchina * qty) + costo_manodopera + (consumabili_fissi_eur * qty)

        # 7. OVERHEAD = subtotale_diretti * overhead_pct
        overhead_pct = Decimal(str(qv.overhead_pct or 10))
        overhead = subtotale_diretti * overhead_pct / Decimal("100")

        # 8. RISCHIO = subtotale_diretti * rischio_pct
        rischio_pct = Decimal(str(qv.rischio_pct or 5))
        rischio = subtotale_diretti * rischio_pct / Decimal("100")

        # 9. COSTO TOTALE NETTO = subtotale_diretti + overhead + rischio
        costo_totale_netto = subtotale_diretti + overhead + rischio

        # 10. PREZZO NETTO - Override o Calcolo
        if qv.prezzo_unitario_vendita is not None:
            # Se è impostato un prezzo di vendita, usa quello
            prezzo_unitario = Decimal(str(qv.prezzo_unitario_vendita))
            prezzo_netto_riga = prezzo_unitario * qty
        else:
            # Altrimenti calcola con margine_pct
            margine_pct = Decimal(str(qv.margine_pct or 20))
            prezzo_netto_riga = costo_totale_netto * (Decimal("1") + margine_pct / Decimal("100"))

        # Salva il totale di riga (senza IVA, lo sconto sarà applicato sul totale)
        line.totale_riga_eur = float(prezzo_netto_riga.quantize(Decimal("0.01")))
        
        # Accumula per il totale
        tot_imponibile += prezzo_netto_riga

    # 11. SCONTO SUL TOTALE (non per riga)
    sconto_eur = Decimal(str(qv.sconto_eur or 0))
    tot_imponibile_scontato = tot_imponibile - sconto_eur
    if tot_imponibile_scontato < 0:
        tot_imponibile_scontato = Decimal("0")

    # 12. IVA SUL TOTALE SCONTATO (solo se applica_iva è True)
    if qv.applica_iva:
        iva_pct = Decimal(str(qv.iva_pct or 22))
        tot_iva = tot_imponibile_scontato * iva_pct / Decimal("100")
        tot_lordo = tot_imponibile_scontato + tot_iva
    else:
        tot_iva = Decimal("0")
        tot_lordo = tot_imponibile_scontato

    # Salva i totali
    qv.totale_imponibile_eur = float(tot_imponibile_scontato.quantize(Decimal("0.01")))
    qv.totale_iva_eur = float(tot_iva.quantize(Decimal("0.01")))
    qv.totale_lordo_eur = float(tot_lordo.quantize(Decimal("0.01")))

