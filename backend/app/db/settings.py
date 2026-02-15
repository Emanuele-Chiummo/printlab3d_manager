from sqlalchemy.orm import Session
from app.models.settings import PreventivoSettingsDB

def get_settings(db: Session) -> PreventivoSettingsDB:
    s = db.query(PreventivoSettingsDB).first()
    if not s:
        s = PreventivoSettingsDB()
        db.add(s)
        db.commit()
        db.refresh(s)
    return s

def update_settings(db: Session, data: dict) -> PreventivoSettingsDB:
    s = get_settings(db)
    for k, v in data.items():
        if hasattr(s, k):
            setattr(s, k, v)
    db.commit()
    db.refresh(s)
    return s
