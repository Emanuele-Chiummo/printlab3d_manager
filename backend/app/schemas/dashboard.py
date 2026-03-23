from pydantic import BaseModel


class DashboardKPI(BaseModel):
    preventivi_mese: int
    job_in_corso: int
    stock_basso: int
    margine_medio_pct: float
    ricavi_mese_eur: float
    costi_mese_eur: float
    utile_mese_eur: float
    clienti_attivi: int


class TrendPoint(BaseModel):
    periodo: str
    ricavi: float
    costi: float
    job_completati: int


class DashboardTrends(BaseModel):
    points: list[TrendPoint]
