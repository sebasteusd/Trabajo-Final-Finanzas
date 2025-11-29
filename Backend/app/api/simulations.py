from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
# CORRECCIÓN 1: Importamos el nombre nuevo "Simulacion"
from app.models.simulation import Simulacion 
from app.models.client import Client
from app.models.user import User
from app.schemas import SimulationCreate, SimulationRead
from app.api.auth import get_current_active_user

router = APIRouter()

# --- GET: Listar mis simulaciones ---
@router.get("/", response_model=List[SimulationRead])
def get_my_simulations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    client = db.query(Client).filter(Client.user_id == current_user.id).first()
    if not client:
        return [] 
    
    # CORRECCIÓN 2: Usamos Simulacion en la query
    simulations = db.query(Simulacion)\
        .filter(Simulacion.id_cliente == client.id_cliente)\
        .filter(Simulacion.is_active == True)\
        .order_by(Simulacion.fecha_simulacion.desc())\
        .all()
        
    return simulations

# --- POST: Guardar ---
@router.post("/", response_model=SimulationRead)
def save_simulation(
    simulation_data: SimulationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    client = db.query(Client).filter(Client.user_id == current_user.id).first()
    if not client:
        # Auto-crear cliente si no existe
        new_client = Client(user_id=current_user.id)
        db.add(new_client)
        db.commit()
        db.refresh(new_client)
        client = new_client

    # CORRECCIÓN 3: Creamos instancia de Simulacion
    new_simulation = Simulacion(
        id_cliente=client.id_cliente,
        **simulation_data.dict()
    )
    
    db.add(new_simulation)
    db.commit()
    db.refresh(new_simulation)
    
    return new_simulation

# --- DELETE ---
@router.delete("/{sim_id}")
def delete_simulation(
    sim_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    client = db.query(Client).filter(Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Perfil de cliente no encontrado")

    # CORRECCIÓN 4: Usamos Simulacion
    simulation = db.query(Simulacion).filter(
        Simulacion.id_simulacion == sim_id,
        Simulacion.id_cliente == client.id_cliente
    ).first()

    if not simulation:
        raise HTTPException(status_code=404, detail="Simulación no encontrada")

    simulation.is_active = False
    db.commit()
    
    return {"message": "Simulación eliminada"}