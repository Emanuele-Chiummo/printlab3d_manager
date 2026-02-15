from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api_v1.deps import get_db, get_current_user, require_roles
from app.models.inventory import Filament, InventoryMovement
from app.models.user import User, UserRole
from app.schemas.inventory import FilamentCreate, FilamentOut, FilamentUpdate, MovementCreate, MovementOut
from app.services.audit import log_action
from app.services.inventory import apply_movement

router = APIRouter()


@router.get("/", response_model=list[FilamentOut])
def list_filaments(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Filament).order_by(Filament.id.desc()).all()


@router.post("/", response_model=FilamentOut, dependencies=[Depends(require_roles(UserRole.admin, UserRole.operator))])
def create_filament(payload: FilamentCreate, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    f = Filament(**payload.model_dump())
    f.created_by_id = current.id
    f.updated_by_id = current.id
    db.add(f)
    db.commit()
    db.refresh(f)
    log_action(db, current.id, "Filament", f.id, "CREATE")
    db.commit()
    return f


@router.put("/{filament_id}", response_model=FilamentOut, dependencies=[Depends(require_roles(UserRole.admin, UserRole.operator))])
def update_filament(filament_id: int, payload: FilamentUpdate, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    f = db.get(Filament, filament_id)
    if not f:
        raise HTTPException(status_code=404, detail="Filamento non trovato")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(f, k, v)
    f.updated_by_id = current.id
    db.commit()
    db.refresh(f)
    log_action(db, current.id, "Filament", f.id, "UPDATE")
    db.commit()
    return f


@router.delete("/{filament_id}", dependencies=[Depends(require_roles(UserRole.admin))])
def delete_filament(filament_id: int, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    f = db.get(Filament, filament_id)
    if not f:
        raise HTTPException(status_code=404, detail="Filamento non trovato")
    db.delete(f)
    db.commit()
    log_action(db, current.id, "Filament", filament_id, "DELETE")
    db.commit()
    return {"ok": True}


@router.post("/movements", response_model=MovementOut, dependencies=[Depends(require_roles(UserRole.admin, UserRole.operator))])
def create_movement(payload: MovementCreate, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    m = InventoryMovement(**payload.model_dump())
    m.created_by_id = current.id
    m.updated_by_id = current.id
    db.add(m)
    apply_movement(db, m)
    db.commit()
    db.refresh(m)
    log_action(db, current.id, "InventoryMovement", m.id, "CREATE")
    db.commit()
    return m


@router.get("/movements", response_model=list[MovementOut])
def list_movements(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(InventoryMovement).order_by(InventoryMovement.id.desc()).limit(200).all()
