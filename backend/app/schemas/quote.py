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
    peso_materiale_g: int = 0
    tempo_stimato_min: int = 0


class QuoteLineOut(BaseModel):
    id: int
    descrizione: str
    filament_id: int | None
    peso_materiale_g: int
    costo_materiale_eur: float
    tempo_stimato_min: int
    costo_macchina_eur: float
    costo_manodopera_eur: float
    totale_riga_eur: float

    class Config:
        from_attributes = True


class QuoteVersionCreate(BaseModel):
    costo_macchina_eur_h: float = 5.0
    costo_manodopera_eur_h: float = 15.0
    overhead_pct: float = 10.0
    margine_pct: float = 20.0
    sconto_eur: float = 0.0
    iva_pct: float = 22.0
    righe: list[QuoteLineCreate] = []


class QuoteVersionUpdate(BaseModel):
    status: QuoteStatus | None = None
    costo_macchina_eur_h: float | None = None
    costo_manodopera_eur_h: float | None = None
    overhead_pct: float | None = None
    margine_pct: float | None = None
    sconto_eur: float | None = None
    iva_pct: float | None = None
    righe: list[QuoteLineCreate] | None = None


class QuoteVersionOut(BaseModel):
    id: int
    quote_id: int
    version_number: int
    status: QuoteStatus
    costo_macchina_eur_h: float
    costo_manodopera_eur_h: float
    overhead_pct: float
    margine_pct: float
    sconto_eur: float
    iva_pct: float
    totale_imponibile_eur: float
    totale_iva_eur: float
    totale_lordo_eur: float
    righe: list[QuoteLineOut]

    class Config:
        from_attributes = True
