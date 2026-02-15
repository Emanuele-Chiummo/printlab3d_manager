from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.inventory import Filament, InventoryMovement, MovementType


def apply_movement(db: Session, movement: InventoryMovement) -> None:
    filament = db.get(Filament, movement.filament_id)
    if not filament:
        raise HTTPException(status_code=404, detail="Filamento non trovato")

    if movement.tipo in (MovementType.carico, MovementType.rettifica):
        filament.peso_residuo_g = max(0, int(filament.peso_residuo_g) + int(movement.delta_peso_g))
    elif movement.tipo == MovementType.scarico:
        new_v = int(filament.peso_residuo_g) - abs(int(movement.delta_peso_g))
        filament.peso_residuo_g = max(0, new_v)
    elif movement.tipo == MovementType.trasferimento:
        # peso invariato, aggiorno ubicazione se presente
        pass

    if movement.to_location_id is not None:
        filament.ubicazione_id = movement.to_location_id
