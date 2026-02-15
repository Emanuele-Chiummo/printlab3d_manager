from datetime import date
from pydantic import BaseModel

from app.models.inventory import MovementType, FilamentStatus


class FilamentBase(BaseModel):
    materiale: str
    marca: str = ""
    colore: str = ""
    colore_hex: str = ""
    diametro_mm: float = 1.75
    peso_nominale_g: int = 1000
    costo_spool_eur: float = 0.0
    note: str = ""
    peso_residuo_g: int = 0
    soglia_min_g: int = 100
    stato: str = FilamentStatus.disponibile.value
    data_acquisto: date | None = None
    ubicazione_id: int | None = None


class FilamentCreate(FilamentBase):
    pass


class FilamentUpdate(BaseModel):
    materiale: str | None = None
    marca: str | None = None
    colore: str | None = None
    colore_hex: str | None = None
    diametro_mm: float | None = None
    peso_nominale_g: int | None = None
    costo_spool_eur: float | None = None
    note: str | None = None
    peso_residuo_g: int | None = None
    soglia_min_g: int | None = None
    stato: str | None = None
    data_acquisto: date | None = None
    ubicazione_id: int | None = None


class FilamentOut(FilamentBase):
    id: int

    class Config:
        from_attributes = True


class MovementCreate(BaseModel):
    tipo: MovementType
    filament_id: int
    delta_peso_g: int
    from_location_id: int | None = None
    to_location_id: int | None = None
    note: str = ""


class MovementOut(BaseModel):
    id: int
    tipo: MovementType
    filament_id: int
    delta_peso_g: int
    from_location_id: int | None
    to_location_id: int | None
    note: str

    class Config:
        from_attributes = True
