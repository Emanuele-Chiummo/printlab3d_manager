from datetime import datetime, timedelta, timezone
from typing import Any

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

# bcrypt seems broken under our container's bcrypt library (always
# throws "password cannot be longer than 72 bytes" even for short secrets).
# pbkdf2_sha256 is pure-Python, secure enough for this app and avoids the
# external dependency.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
ALGORITHM = "HS256"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    # bcrypt is limited to 72 *bytes*; passlib will raise a ValueError if a
    # longer secret is given.  We'll truncate on the byte level, then give
    # passlib a *string* that encodes to <=72 bytes.  This avoids issues where
    # passlib might re‑encode our bytes and accidentally exceed the limit again.
    pw_bytes = password.encode("utf-8")
    if len(pw_bytes) > 72:
        pw_bytes = pw_bytes[:72]
        # decode back to string for hashing; ignore any invalid tail split by
        # truncation.
        password = pw_bytes.decode("utf-8", errors="ignore")
    return pwd_context.hash(password)


def create_access_token(subject: str, extra: dict[str, Any] | None = None, expires_minutes: int | None = None) -> str:
    if expires_minutes is None:
        expires_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    to_encode: dict[str, Any] = {"sub": subject, "exp": expire}
    if extra:
        to_encode.update(extra)
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
