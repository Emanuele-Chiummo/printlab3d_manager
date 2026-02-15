from pydantic import BaseModel


class CostCategoryCreate(BaseModel):
    nome: str
    descrizione: str = ""


class CostCategoryOut(BaseModel):
    id: int
    nome: str
    descrizione: str

    class Config:
        from_attributes = True


class CostEntryCreate(BaseModel):
    categoria_id: int
    importo_eur: float
    periodo_yyyymm: str
    job_id: int | None = None
    note: str = ""


class CostEntryOut(BaseModel):
    id: int
    categoria_id: int
    importo_eur: float
    periodo_yyyymm: str
    job_id: int | None
    note: str

    class Config:
        from_attributes = True


class MonthlyCostReportItem(BaseModel):
    periodo_yyyymm: str
    totale_eur: float


class CostByJobReportItem(BaseModel):
    job_id: int
    quote_codice: str
    customer: str
    periodo_yyyymm: str
    totale_eur: float


class CostByCustomerReportItem(BaseModel):
    customer_id: int
    customer: str
    totale_eur: float
