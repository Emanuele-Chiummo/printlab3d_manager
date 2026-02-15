from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.db.session import SessionLocal
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token non valido")
    user = db.get(User, int(user_id)) if user_id else None
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Utente non valido")
    return user


def require_roles(*roles: UserRole):
    def _dep(current: User = Depends(get_current_user)) -> User:
        # current.role may be stored as a plain string; convert to the enum
        # so we can compare against the supplied members.  If conversion
        # fails the user clearly has an invalid role and should be denied.
        try:
            current_role = UserRole(current.role)  # type: ignore[arg-type]
        except Exception:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permesso negato")

        if current_role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permesso negato")
        return current

    return _dep
