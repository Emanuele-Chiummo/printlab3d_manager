from sqlalchemy import Column, Integer, Float
from app.models.base import Base

class PreventivoSettingsDB(Base):
    __tablename__ = 'preventivo_settings'
    id = Column(Integer, primary_key=True, index=True)
    costo_kwh_eur = Column(Float, default=0.15)
    costo_manodopera_eur_h = Column(Float, default=10)
    margine_pct = Column(Float, default=30)
    overhead_pct = Column(Float, default=5)
    fattore_rischio_pct = Column(Float, default=5)
    consumabili_eur_stampa = Column(Float, default=0.5)
    soglia_filamento_basso_g = Column(Float, default=150)
