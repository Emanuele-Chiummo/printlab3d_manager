import enum
from sqlalchemy import Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.base import TimestampMixin, AuditUserMixin


class JobStatus(str, enum.Enum):
    pianificato = "PIANIFICATO"
    in_corso = "IN_CORSO"
    completato = "COMPLETATO"
    annullato = "ANNULLATO"


class Job(Base, TimestampMixin, AuditUserMixin):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    quote_version_id: Mapped[int] = mapped_column(ForeignKey("quote_versions.id"))
    # store status as uppercase string (the enum's ``value``) rather than
    # relying on a Postgres enum type.  SQLAlchemy's default ``Enum`` binds
    # the *member name* which was lowercase (e.g. "in_corso"), and the
    # database column was defined with uppercase literals; the mismatch
    # produced the runtime errors you were seeing.  Using a plain VARCHAR
    # avoids DB type issues and keeps the enum purely a Python convenience.
    status: Mapped[str] = mapped_column(String(20), default=JobStatus.pianificato.value)

    @property
    def status_enum(self) -> JobStatus:
        """Return the :class:`JobStatus` for the current string value."""
        return JobStatus(self.status)

    # Consuntivi
    tempo_reale_min: Mapped[int] = mapped_column(Integer, default=0)
    energia_kwh: Mapped[float] = mapped_column(Numeric(10, 3), default=0)
    scarti_g: Mapped[int] = mapped_column(Integer, default=0)
    note: Mapped[str] = mapped_column(Text, default="")

    costo_finale_eur: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)
    margine_eur: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)

    quote_version = relationship("QuoteVersion")
    consumi = relationship("JobConsumption", back_populates="job", cascade="all, delete-orphan")


class JobConsumption(Base, TimestampMixin, AuditUserMixin):
    __tablename__ = "job_consumptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id"))
    filament_id: Mapped[int] = mapped_column(ForeignKey("filaments.id"))
    peso_g: Mapped[int] = mapped_column(Integer, default=0)

    job = relationship("Job", back_populates="consumi")
    filament = relationship("Filament")
