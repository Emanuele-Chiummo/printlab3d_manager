from pydantic import BaseModel


class LocationBase(BaseModel):
    nome: str
    tipo: str = "SLOT"
    parent_id: int | None = None


class LocationCreate(LocationBase):
    pass


class LocationUpdate(BaseModel):
    nome: str | None = None
    tipo: str | None = None
    parent_id: int | None = None


class LocationOut(LocationBase):
    id: int

    class Config:
        from_attributes = True
