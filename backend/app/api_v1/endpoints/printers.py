from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.api_v1.deps import get_db, get_current_user, require_roles
from app.models.user import User, UserRole
from app.models.printer import Printer
from app.schemas.printer import PrinterCreate, PrinterUpdate, PrinterOut

router = APIRouter()


@router.get("", response_model=List[PrinterOut])
def list_printers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lista tutte le stampanti"""
    return db.query(Printer).order_by(Printer.id).all()


@router.post("", response_model=PrinterOut, dependencies=[Depends(require_roles(UserRole.admin, UserRole.operator))])
def create_printer(
    payload: PrinterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Crea una nuova stampante"""
    printer = Printer(**payload.model_dump())
    db.add(printer)
    db.commit()
    db.refresh(printer)
    return printer


@router.get("/{printer_id}", response_model=PrinterOut)
def get_printer(
    printer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Recupera una stampante per ID"""
    printer = db.query(Printer).filter(Printer.id == printer_id).first()
    if not printer:
        raise HTTPException(status_code=404, detail="Stampante non trovata")
    return printer


@router.put("/{printer_id}", response_model=PrinterOut, dependencies=[Depends(require_roles(UserRole.admin, UserRole.operator))])
def update_printer(
    printer_id: int,
    payload: PrinterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Aggiorna una stampante esistente"""
    printer = db.query(Printer).filter(Printer.id == printer_id).first()
    if not printer:
        raise HTTPException(status_code=404, detail="Stampante non trovata")
    
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(printer, field, value)
    
    db.commit()
    db.refresh(printer)
    return printer


@router.delete("/{printer_id}", dependencies=[Depends(require_roles(UserRole.admin, UserRole.operator))])
def delete_printer(
    printer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Elimina una stampante"""
    printer = db.query(Printer).filter(Printer.id == printer_id).first()
    if not printer:
        raise HTTPException(status_code=404, detail="Stampante non trovata")
    
    db.delete(printer)
    db.commit()
    return {"detail": "Stampante eliminata con successo"}
    
    db.delete(printer)
    db.commit()
    return {"detail": "Stampante eliminata con successo"}
