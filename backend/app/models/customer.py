from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base
from app.models.base import TimestampMixin, AuditUserMixin


class Customer(Base, TimestampMixin, AuditUserMixin):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tipo_cliente: Mapped[str] = mapped_column(String(10), default="DITTA")  # DITTA o PERSONA
    ragione_sociale: Mapped[str] = mapped_column(String(255), index=True, default="")
    nome: Mapped[str] = mapped_column(String(100), default="")
    cognome: Mapped[str] = mapped_column(String(100), default="")
    codice_fiscale: Mapped[str] = mapped_column(String(16), default="")
    piva: Mapped[str] = mapped_column(String(30), default="")
    email: Mapped[str] = mapped_column(String(255), default="")
    telefono: Mapped[str] = mapped_column(String(50), default="")
    indirizzo: Mapped[str] = mapped_column(String(255), default="")
    note: Mapped[str] = mapped_column(Text, default="")
