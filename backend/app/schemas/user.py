from pydantic import BaseModel

from app.models.user import UserRole


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserBase(BaseModel):
    # we intentionally allow non‑RFC domains (e.g. printlab.local) for
    # development/demo purposes
    email: str
    full_name: str = ""
    role: UserRole = UserRole.viewer
    is_active: bool = True
    must_reset_password: bool = False


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: str | None = None
    role: UserRole | None = None
    is_active: bool | None = None
    password: str | None = None
    must_reset_password: bool | None = None


class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True
