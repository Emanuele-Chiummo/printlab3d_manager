from pydantic import BaseModel

from app.models.quote import QuoteStatus


class QuoteCreate(BaseModel):
    codice: str
    customer_id: int
    note: str = ""


class QuoteOut(BaseModel):
    id: int
    codice: str
    customer_id: int
    note: str

    class Config:
        from_attributes = True


class QuoteLineCreate(BaseModel):
    descrizione: str
    filament_id: int | None = None
    quantita: int = 1
    peso_materiale_g: float = 0.0
    tempo_stimato_min: int = 0
    ore_manodopera_min: float = 0.0


class QuoteLineOut(BaseModel):
    id: int
    descrizione: str
    filament_id: int | None
    quantita: int
    peso_materiale_g: float
    costo_materiale_eur: float
    tempo_stimato_min: int
    ore_manodopera_min: float
    costo_macchina_eur: float
    costo_manodopera_eur: float
    costo_energia_eur: float
    costo_consumabili_eur: float
    totale_riga_eur: float

    class Config:
        from_attributes = True


class QuoteVersionCreate(BaseModel):
    printer_id: int | None = None
    costo_macchina_eur_h: float = 0.08
    costo_manodopera_eur_h: float = 0.0
    potenza_w: float = 200.0
    costo_energia_kwh: float = 0.15
    consumabili_fissi_eur: float = 0.0
    overhead_pct: float = 10.0
    rischio_pct: float = 5.0
    margine_pct: float = 20.0
    sconto_eur: float = 0.0
    iva_pct: float = 22.0
    applica_iva: bool = True
    prezzo_unitario_vendita: float | None = None
    righe: list[QuoteLineCreate] = []


class QuoteVersionUpdate(BaseModel):
    status: QuoteStatus | None = None
    printer_id: int | None = None
    costo_macchina_eur_h: float | None = None
    costo_manodopera_eur_h: float | None = None
    potenza_w: float | None = None
    costo_energia_kwh: float | None = None
    consumabili_fissi_eur: float | None = None
    overhead_pct: float | None = None
    rischio_pct: float | None = None
    margine_pct: float | None = None
    sconto_eur: float | None = None
    iva_pct: float | None = None
    applica_iva: bool | None = None
    prezzo_unitario_vendita: float | None = None
    righe: list[QuoteLineCreate] | None = None


class QuoteVersionOut(BaseModel):
    id: int
    quote_id: int
    version_number: int
    status: QuoteStatus
    printer_id: int | None
    costo_macchina_eur_h: float
    costo_manodopera_eur_h: float
    potenza_w: float
    costo_energia_kwh: float
    consumabili_fissi_eur: float
    overhead_pct: float
    rischio_pct: float
    margine_pct: float
    sconto_eur: float
    iva_pct: float
    applica_iva: bool
    prezzo_unitario_vendita: float | None
    totale_imponibile_eur: float
    totale_iva_eur: float
    totale_lordo_eur: float
    righe: list[QuoteLineOut]

    class Config:
        from_attributes = True
