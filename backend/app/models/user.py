import enum

from sqlalchemy import Boolean, Enum as SAEnum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import TypeDecorator

from app.db.session import Base
from app.models.base import TimestampMixin


class EnumValue(SAEnum):
    """Enum type that writes ``enum.value`` instead of the name.

    The regular ``SAEnum`` will always bind the *member name* (``enum.name``),
    which in our case is the lowercase identifier.  ``EnumValue`` intercepts
    both enum instances and strings passed to the column and normalizes them to
    the uppercase ``value``.
    """

    cache_ok = True

    def process_bind_param(self, value, dialect):
        # value may be an enum member or a string.  In either case we want to
        # make sure the *value* is stored, not the name.  We also tolerate
        # members passed via their name (e.g. "admin") by looking them up.
        if isinstance(value, enum.Enum):
            return value.value
        if isinstance(value, str) and hasattr(self, "enum_class"):
            try:
                member = self.enum_class(value)
            except Exception:
                # not a valid member name/value; let SAEnum handle the error
                return super().process_bind_param(value, dialect)
            return member.value
        return super().process_bind_param(value, dialect)


class UserRole(str, enum.Enum):
    admin = "ADMIN"
    operator = "OPERATORE"
    sales = "COMMERCIALE"
    viewer = "VIEWER"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), default="")
    hashed_password: Mapped[str] = mapped_column(String(255))
    # store role as simple uppercase string; we perform validation in Python
    # when reading or writing to avoid DB enum issues.
    role: Mapped[str] = mapped_column(String(20), default=UserRole.viewer.value)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    must_reset_password: Mapped[bool] = mapped_column(Boolean, default=False)
