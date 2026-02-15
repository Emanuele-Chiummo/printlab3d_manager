from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

from app.models.quote import Quote, QuoteVersion
from app.models.settings import PreventivoSettingsDB


def render_quote_pdf(quote: Quote, qv: QuoteVersion, settings: PreventivoSettingsDB) -> (bytes, str):
    buff = BytesIO()
    # Nome file dinamico
    filename = f"PREVENTIVO_{quote.codice}_v{qv.version_number}.pdf"
    c = canvas.Canvas(buff, pagesize=A4)
    width, height = A4



    # Layout semplificato: solo testo e linee orizzontali
    x = 20 * mm
    y = height - 25 * mm
    c.setFont("Helvetica-Bold", 18)
    c.drawString(x, y, settings.company_name)
    c.setFont("Helvetica", 10)
    c.drawString(x, y - 7 * mm, f"{settings.company_address} | {settings.company_email} | {settings.company_phone}")
    y -= 20 * mm
    c.setLineWidth(0.5)
    c.line(x, y, x + 170 * mm, y)
    y -= 7 * mm
    c.setFont("Helvetica-Bold", 15)
    c.drawString(x, y, f"PREVENTIVO N. {quote.codice} - v{qv.version_number}")
    y -= 10 * mm
    c.setLineWidth(0.2)
    c.line(x, y, x + 170 * mm, y)
    y -= 7 * mm
    c.setFont("Helvetica-Bold", 10)
    c.drawString(x, y, "Dati cliente:")
    y -= 6 * mm
    c.setFont("Helvetica", 10)
    cliente_str = quote.customer.ragione_sociale.strip() if quote.customer.ragione_sociale and quote.customer.ragione_sociale.strip() != '' else f"{quote.customer.nome} {quote.customer.cognome}".strip()
    c.drawString(x, y, cliente_str)
    y -= 6 * mm
    c.drawString(x, y, f"Email: {quote.customer.email or '-'} | Tel: {quote.customer.telefono or '-'}")
    y -= 6 * mm
    c.drawString(x, y, f"Indirizzo: {quote.customer.indirizzo or '-'}")
    y -= 10 * mm
    # Stato solo testo
    stato_str = str(qv.status).replace('QuoteStatus.', '')
    c.setFont("Helvetica-Bold", 12)
    c.drawString(x, y, f"Stato: {stato_str}")
    y -= 12 * mm
    c.setLineWidth(0.5)
    c.line(x, y, x + 170 * mm, y)
    y -= 8 * mm

    # Tabella righe semplice
    # Tabella righe semplice
    c.setFont("Helvetica-Bold", 10)
    c.drawString(x, y, "Descrizione")
    c.drawString(x + 60 * mm, y, "Materiale (g)")
    c.drawString(x + 90 * mm, y, "Tempo (min)")
    c.drawString(x + 120 * mm, y, "Totale riga (€)")
    y -= 7 * mm
    c.setLineWidth(0.2)
    c.line(x, y, x + 150 * mm, y)
    y -= 3 * mm
    c.setFont("Helvetica", 9)
    for line in qv.righe:
        if y < 40 * mm:
            c.showPage()
            y = height - 25 * mm
        c.drawString(x, y, line.descrizione)
        c.drawString(x + 60 * mm, y, str(line.peso_materiale_g))
        c.drawString(x + 90 * mm, y, str(line.tempo_stimato_min))
        c.drawString(x + 120 * mm, y, f"€ {float(line.totale_riga_eur):.2f}")
        y -= 7 * mm

    y -= 10 * mm
    c.setLineWidth(0.2)
    c.line(x, y, x + 150 * mm, y)
    y -= 6 * mm
    c.setFont("Helvetica-Bold", 12)
    if qv.applica_iva:
        c.drawString(x, y, f"Totale imponibile: € {float(qv.totale_imponibile_eur):.2f}")
        y -= 8 * mm
        c.setFont("Helvetica-Bold", 11)
        c.drawString(x, y, f"IVA ({float(qv.iva_pct):.2f}%): € {float(qv.totale_iva_eur):.2f}")
        y -= 8 * mm
        c.setFont("Helvetica-Bold", 13)
        c.drawString(x, y, f"Totale IVA inclusa: € {float(qv.totale_lordo_eur):.2f}")
    else:
        c.drawString(x, y, f"Totale: € {float(qv.totale_imponibile_eur):.2f}")
    y -= 16 * mm

    c.setFont("Helvetica-Oblique", 8)
    c.drawString(x, 20 * mm, "Documento generato automaticamente da PrintLab3D Manager")
    c.showPage()
    c.save()
    return buff.getvalue(), filename
