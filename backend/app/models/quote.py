import enum
from sqlalchemy import Boolean, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.base import TimestampMixin, AuditUserMixin


class QuoteStatus(str, enum.Enum):
    BOZZA = "BOZZA"
    INVIATO = "INVIATO"
    ACCETTATO = "ACCETTATO"
    RIFIUTATO = "RIFIUTATO"


class Quote(Base, TimestampMixin, AuditUserMixin):
    __tablename__ = "quotes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    codice: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"))
    note: Mapped[str] = mapped_column(Text, default="")

    customer = relationship("Customer")
    versions = relationship("QuoteVersion", back_populates="quote", cascade="all, delete-orphan", order_by="QuoteVersion.version_number")


class QuoteVersion(Base, TimestampMixin, AuditUserMixin):
    __tablename__ = "quote_versions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    quote_id: Mapped[int] = mapped_column(ForeignKey("quotes.id"))
    version_number: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[QuoteStatus] = mapped_column(Enum(QuoteStatus), default=QuoteStatus.BOZZA)



    # Parametri economici
    costo_macchina_eur_h: Mapped[float] = mapped_column(Numeric(10, 2), default=0.08)
    costo_manodopera_eur_h: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)
    potenza_w: Mapped[float] = mapped_column(Numeric(10, 2), default=200.0)
    costo_energia_kwh: Mapped[float] = mapped_column(Numeric(10, 4), default=0.15)
    consumabili_fissi_eur: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)
    overhead_pct: Mapped[float] = mapped_column(Numeric(5, 2), default=10.0)
    rischio_pct: Mapped[float] = mapped_column(Numeric(5, 2), default=5.0)
    margine_pct: Mapped[float] = mapped_column(Numeric(5, 2), default=20.0)
    sconto_eur: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)
    iva_pct: Mapped[float] = mapped_column(Numeric(5, 2), default=22.0)
    applica_iva: Mapped[bool] = mapped_column(Boolean, default=True)
    prezzo_unitario_vendita: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True, default=None)

    # Totali calcolati
    totale_imponibile_eur: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)
    totale_iva_eur: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)
    totale_lordo_eur: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)

    quote = relationship("Quote", back_populates="versions")
    righe = relationship("QuoteLine", back_populates="quote_version", cascade="all, delete-orphan")


class QuoteLine(Base, TimestampMixin, AuditUserMixin):
    __tablename__ = "quote_lines"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    quote_version_id: Mapped[int] = mapped_column(ForeignKey("quote_versions.id"))

    descrizione: Mapped[str] = mapped_column(String(255))
    filament_id: Mapped[int | None] = mapped_column(ForeignKey("filaments.id"), nullable=True)
    quantita: Mapped[int] = mapped_column(Integer, default=1)

    peso_materiale_g: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)
    costo_materiale_eur: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)

    tempo_stimato_min: Mapped[int] = mapped_column(Integer, default=0)
    ore_manodopera_min: Mapped[int] = mapped_column(Integer, default=0)
    costo_macchina_eur: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)
    costo_manodopera_eur: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)
    costo_energia_eur: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)
    costo_consumabili_eur: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)

    totale_riga_eur: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)

    quote_version = relationship("QuoteVersion", back_populates="righe")
    filament = relationship("Filament")
