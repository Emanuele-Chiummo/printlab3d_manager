from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api_v1.deps import get_db, require_roles, get_current_user
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserOut, UserUpdate
from app.services.audit import log_action

router = APIRouter()


@router.get("/count", response_model=int)
def user_count(db: Session = Depends(get_db)):
    return db.query(User).count()


@router.get("/", response_model=list[UserOut], dependencies=[Depends(require_roles(UserRole.admin))])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.id).all()


@router.post("/", response_model=UserOut, dependencies=[Depends(require_roles(UserRole.admin))])
def create_user(payload: UserCreate, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email già esistente")
    u = User(
        email=payload.email,
        full_name=payload.full_name,
        role=payload.role,
        is_active=payload.is_active,
        hashed_password=get_password_hash(payload.password),
        must_reset_password=True,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    log_action(db, current.id, "User", u.id, "CREATE")
    db.commit()
    return u


@router.post("/first-admin", response_model=UserOut)
def create_first_admin(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).count() > 0:
        raise HTTPException(status_code=403, detail="Admin già esistente")
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email già esistente")
    u = User(
        email=payload.email,
        full_name=payload.full_name,
        role=UserRole.admin.value,
        is_active=True,
        hashed_password=get_password_hash(payload.password),
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


@router.put("/{user_id}", response_model=UserOut, dependencies=[Depends(require_roles(UserRole.admin))])
def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    u = db.get(User, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    if payload.full_name is not None:
        u.full_name = payload.full_name
    if payload.role is not None:
        u.role = payload.role
    if payload.is_active is not None:
        u.is_active = payload.is_active
    if payload.password:
        u.hashed_password = get_password_hash(payload.password)
    db.commit()
    db.refresh(u)
    log_action(db, current.id, "User", u.id, "UPDATE")
    db.commit()
    return u


@router.post("/{user_id}/reset-password", response_model=UserOut)
def reset_password(user_id: int, payload: UserUpdate, db: Session = Depends(get_db)):
    u = db.get(User, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    if not payload.password:
        raise HTTPException(status_code=400, detail="Password mancante")
    u.hashed_password = get_password_hash(payload.password)
    u.must_reset_password = False
    db.commit()
    db.refresh(u)
    return u


@router.post("/{user_id}/toggle-active", response_model=UserOut, dependencies=[Depends(require_roles(UserRole.admin))])
def toggle_active(user_id: int, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    u = db.get(User, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    if u.id == current.id:
        raise HTTPException(status_code=400, detail="Non puoi disattivare il tuo account")
    u.is_active = not u.is_active
    db.commit()
    db.refresh(u)
    log_action(db, current.id, "User", u.id, "TOGGLE_ACTIVE")
    db.commit()
    return u
