import enum
from sqlalchemy import Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.base import TimestampMixin, AuditUserMixin


class MovementType(str, enum.Enum):
    carico = "CARICO"
    scarico = "SCARICO"
    trasferimento = "TRASFERIMENTO"
    rettifica = "RETTIFICA"


class Filament(Base, TimestampMixin, AuditUserMixin):
    __tablename__ = "filaments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    materiale: Mapped[str] = mapped_column(String(50))
    marca: Mapped[str] = mapped_column(String(100), default="")
    colore: Mapped[str] = mapped_column(String(100), default="")
    diametro_mm: Mapped[float] = mapped_column(Numeric(4, 2), default=1.75)
    peso_nominale_g: Mapped[int] = mapped_column(Integer, default=1000)
    costo_spool_eur: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    note: Mapped[str] = mapped_column(Text, default="")
    peso_residuo_g: Mapped[int] = mapped_column(Integer, default=0)
    soglia_min_g: Mapped[int] = mapped_column(Integer, default=100)

    ubicazione_id: Mapped[int | None] = mapped_column(ForeignKey("locations.id"), nullable=True)
    ubicazione = relationship("Location", back_populates="filamenti")


class InventoryMovement(Base, TimestampMixin, AuditUserMixin):
    __tablename__ = "inventory_movements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tipo: Mapped[MovementType] = mapped_column(Enum(MovementType))
    filament_id: Mapped[int] = mapped_column(ForeignKey("filaments.id"))
    delta_peso_g: Mapped[int] = mapped_column(Integer)
    from_location_id: Mapped[int | None] = mapped_column(ForeignKey("locations.id"), nullable=True)
    to_location_id: Mapped[int | None] = mapped_column(ForeignKey("locations.id"), nullable=True)
    note: Mapped[str] = mapped_column(Text, default="")

    filament = relationship("Filament")
    from_location = relationship("Location", foreign_keys=[from_location_id])
    to_location = relationship("Location", foreign_keys=[to_location_id])
