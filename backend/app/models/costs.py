from sqlalchemy import ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.base import TimestampMixin, AuditUserMixin


class CostCategory(Base, TimestampMixin, AuditUserMixin):
    __tablename__ = "cost_categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nome: Mapped[str] = mapped_column(String(120), unique=True)
    descrizione: Mapped[str] = mapped_column(Text, default="")


class CostEntry(Base, TimestampMixin, AuditUserMixin):
    __tablename__ = "cost_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    categoria_id: Mapped[int] = mapped_column(ForeignKey("cost_categories.id"))
    importo_eur: Mapped[float] = mapped_column(Numeric(12, 2))
    periodo_yyyymm: Mapped[str] = mapped_column(String(7))  # es. 2026-02
    job_id: Mapped[int | None] = mapped_column(ForeignKey("jobs.id"), nullable=True)
    note: Mapped[str] = mapped_column(Text, default="")

    categoria = relationship("CostCategory")
    job = relationship("Job")
