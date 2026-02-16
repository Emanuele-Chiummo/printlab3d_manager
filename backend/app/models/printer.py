from sqlalchemy import Column, Integer, String, Numeric, Text, Enum as SqlEnum, DateTime
from sqlalchemy.sql import func
import enum
from app.models.base import Base


class PrinterStatus(str, enum.Enum):
    ATTIVA = "ATTIVA"
    MANUTENZIONE = "MANUTENZIONE"
    INATTIVA = "INATTIVA"


class Printer(Base):
    __tablename__ = "printers"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    modello = Column(String, nullable=False)
    potenza_w = Column(Numeric(10, 2), nullable=False)
    costo_macchina_eur = Column(Numeric(10, 2), nullable=False)
    vita_stimata_h = Column(Numeric(10, 2), nullable=False, default=8000)
    manutenzione_eur_h = Column(Numeric(10, 4), nullable=False, default=0.20)
    stato = Column(SqlEnum(PrinterStatus), nullable=False, default=PrinterStatus.ATTIVA)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    @property
    def deprezzamento_eur_h(self) -> float:
        """Calcola il deprezzamento orario: costo_macchina / vita_stimata_h"""
        if self.vita_stimata_h and float(self.vita_stimata_h) > 0:
            return float(self.costo_macchina_eur) / float(self.vita_stimata_h)
        return 0.0

    @property
    def totale_macchina_eur_h(self) -> float:
        """Calcola il costo totale orario: deprezzamento + manutenzione"""
        return self.deprezzamento_eur_h + float(self.manutenzione_eur_h)
