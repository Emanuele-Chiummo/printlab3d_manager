from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


class PrinterBase(BaseModel):
    nome: str
    modello: str
    potenza_w: Decimal = Field(description="Potenza in Watt")
    costo_macchina_eur: Decimal = Field(description="Costo macchina in Euro")
    vita_stimata_h: Decimal = Field(default=Decimal("8000"), description="Vita stimata in ore")
    manutenzione_eur_h: Decimal = Field(default=Decimal("0.20"), description="Costo manutenzione €/h")
    stato: str = "ATTIVA"
    note: Optional[str] = None


class PrinterCreate(PrinterBase):
    pass


class PrinterUpdate(BaseModel):
    nome: Optional[str] = None
    modello: Optional[str] = None
    potenza_w: Optional[Decimal] = None
    costo_macchina_eur: Optional[Decimal] = None
    vita_stimata_h: Optional[Decimal] = None
    manutenzione_eur_h: Optional[Decimal] = None
    stato: Optional[str] = None
    note: Optional[str] = None


class PrinterOut(PrinterBase):
    id: int
    deprezzamento_eur_h: float = Field(description="Deprezzamento orario calcolato")
    totale_macchina_eur_h: float = Field(description="Costo totale macchina €/h")
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
