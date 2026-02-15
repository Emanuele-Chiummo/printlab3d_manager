
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api_v1.deps import get_db, get_current_user, require_roles
from app.models.location import Location
from app.models.user import User, UserRole
from app.schemas.location import LocationCreate, LocationOut, LocationUpdate
from app.services.audit import log_action

router = APIRouter()

@router.get("", response_model=list[LocationOut])
def list_locations_noslash(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Location).order_by(Location.id).all()

router = APIRouter()


@router.get("/", response_model=list[LocationOut])
def list_locations(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Location).order_by(Location.id).all()


@router.post("/", response_model=LocationOut, dependencies=[Depends(require_roles(UserRole.admin, UserRole.operator))])
def create_location(payload: LocationCreate, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    loc = Location(**payload.model_dump())
    loc.created_by_id = current.id
    loc.updated_by_id = current.id
    db.add(loc)
    db.commit()
    db.refresh(loc)
    log_action(db, current.id, "Location", loc.id, "CREATE")
    db.commit()
    return loc


@router.put("/{loc_id}", response_model=LocationOut, dependencies=[Depends(require_roles(UserRole.admin, UserRole.operator))])
def update_location(loc_id: int, payload: LocationUpdate, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    loc = db.get(Location, loc_id)
    if not loc:
        raise HTTPException(status_code=404, detail="Ubicazione non trovata")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(loc, k, v)
    loc.updated_by_id = current.id
    db.commit()
    db.refresh(loc)
    log_action(db, current.id, "Location", loc.id, "UPDATE")
    db.commit()
    return loc
