from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api_v1.deps import get_db, get_current_user, require_roles
from app.models.customer import Customer
from app.models.user import User, UserRole
from app.schemas.customer import CustomerCreate, CustomerOut, CustomerUpdate
from app.services.audit import log_action

router = APIRouter()


@router.get("/", response_model=list[CustomerOut])
def list_customers(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Customer).order_by(Customer.id.desc()).all()


@router.post("/", response_model=CustomerOut, dependencies=[Depends(require_roles(UserRole.admin, UserRole.sales, UserRole.operator))])
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    c = Customer(**payload.model_dump())
    c.created_by_id = current.id
    c.updated_by_id = current.id
    db.add(c)
    db.commit()
    db.refresh(c)
    log_action(db, current.id, "Customer", c.id, "CREATE")
    db.commit()
    return c


@router.put("/{customer_id}", response_model=CustomerOut, dependencies=[Depends(require_roles(UserRole.admin, UserRole.sales, UserRole.operator))])
def update_customer(customer_id: int, payload: CustomerUpdate, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    c = db.get(Customer, customer_id)
    if not c:
        raise HTTPException(status_code=404, detail="Cliente non trovato")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(c, k, v)
    c.updated_by_id = current.id
    db.commit()
    db.refresh(c)
    log_action(db, current.id, "Customer", c.id, "UPDATE")
    db.commit()
    return c


@router.delete("/{customer_id}", dependencies=[Depends(require_roles(UserRole.admin))])
def delete_customer(customer_id: int, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    c = db.get(Customer, customer_id)
    if not c:
        raise HTTPException(status_code=404, detail="Cliente non trovato")
    db.delete(c)
    db.commit()
    log_action(db, current.id, "Customer", customer_id, "DELETE")
    db.commit()
    return {"ok": True}
