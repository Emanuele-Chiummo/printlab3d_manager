from pydantic import BaseModel

from app.models.job import JobStatus


class JobCreateFromQuote(BaseModel):
    quote_version_id: int


class JobUpdate(BaseModel):
    status: JobStatus | None = None
    tempo_reale_min: int | None = None
    energia_kwh: float | None = None
    scarti_g: int | None = None
    note: str | None = None


class JobConsumptionCreate(BaseModel):
    filament_id: int
    peso_g: int


class JobConsumptionOut(BaseModel):
    id: int
    filament_id: int
    peso_g: int

    class Config:
        from_attributes = True


class JobOut(BaseModel):
    id: int
    quote_version_id: int
    status: JobStatus
    tempo_reale_min: int
    energia_kwh: float
    scarti_g: int
    note: str
    costo_finale_eur: float
    margine_eur: float
    consumi: list[JobConsumptionOut]

    class Config:
        from_attributes = True
