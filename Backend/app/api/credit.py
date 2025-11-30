# backend/app/api/credit.py

from fastapi import APIRouter, Depends, HTTPException # 'Depends' ya lo tienes aquí
from sqlalchemy.orm import Session # <-- AGREGAR Session de SQLAlchemy
from app.models.credit import CreditInput, CreditOutput
from app.services.simulator import simulate_credit
from app.services.eligibility import check_techo_propio_eligibility
from app.models.client import Client
from app.models.user import User
from app.database import get_db
from app.api.auth import get_current_user 

router = APIRouter()

@router.post("/simulate", response_model=CreditOutput)
# CORRECCIÓN: 'Session' y 'Depends' necesitan ser importados de sus respectivos módulos.
def simulate(data: CreditInput, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    
    # 1. OBTENER DATOS DEL CLIENTE
    client = db.query(Client).filter(Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(status_code=400, detail="Perfil financiero (Client) no encontrado.")
        
    # 2. CORRER VERIFICACIÓN DE ELEGIBILIDAD
    eligibility = check_techo_propio_eligibility(current_user, client)
    
    # 3. CONTROL DE SEGURIDAD
    if not eligibility["is_eligible"] and data.bono_techo_propio > 0:
        raise HTTPException(status_code=403, detail=f"No es elegible para el bono: {eligibility['reason']}")
        
    # 4. PROCEDER A LA SIMULACIÓN
    result = simulate_credit(data)
    
    # 5. AGREGAR EL ESTADO DE ELEGIBILIDAD AL RESULTADO
    result["is_techo_propio_eligible"] = eligibility["is_eligible"]
    result["techo_propio_status"] = eligibility["reason"]
    
    return result