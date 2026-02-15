from sqlalchemy import ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.base import TimestampMixin, AuditUserMixin


class Location(Base, TimestampMixin, AuditUserMixin):
    __tablename__ = "locations"
    __table_args__ = (UniqueConstraint("parent_id", "nome", name="uq_location_parent_nome"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nome: Mapped[str] = mapped_column(String(120))
    tipo: Mapped[str] = mapped_column(String(30), default="SLOT")  # MAGAZZINO/SCAFFALE/RIPIANO/SLOT

    parent_id: Mapped[int | None] = mapped_column(ForeignKey("locations.id"), nullable=True)
    parent = relationship("Location", remote_side=[id], back_populates="children")
    children = relationship("Location", back_populates="parent", cascade="all, delete-orphan")

    filamenti = relationship("Filament", back_populates="ubicazione")

    def full_path(self) -> str:
        parts = [self.nome]
        p = self.parent
        while p is not None:
            parts.append(p.nome)
            p = p.parent
        return " / ".join(reversed(parts))
