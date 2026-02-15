from sqlalchemy.orm import Session

from app.models.audit import AuditLog


def log_action(db: Session, actor_user_id: int | None, entity: str, entity_id: int, action: str, details: str = "") -> None:
    db.add(AuditLog(actor_user_id=actor_user_id, entity=entity, entity_id=entity_id, action=action, details=details))
