from pydantic import BaseModel


class DashboardKPI(BaseModel):
    preventivi_mese: int
    job_in_corso: int
    stock_basso: int
    margine_medio_pct: float
