from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import date

from app.database import get_db
from app.models.user import User
from app.models.client import Client
from app.api.auth import get_current_user # Reutilizamos tu seguridad

router = APIRouter()

# --- Schemas para esta vista ---
class OpportunityRead(BaseModel):
    id_cliente: int
    nombre_completo: str
    email: str
    telefono: Optional[str]
    direccion: Optional[str]
    ingresos: float
    estado_seguimiento: str
    notas: Optional[str]
    score: int
    probabilidad: str # "ALTA", "MEDIA", "BAJA"

    class Config:
        from_attributes = True

# --- Lógica de Scoring (El Cerebro) ---
def calcular_score(user: User, client: Client) -> int:
    score = 0
    
    # 1. Factor Ingresos (Peso alto)
    ingresos = float(client.ingresos_mensuales or 0)
    if ingresos > 8000:
        score += 50
    elif ingresos > 4000:
        score += 30
    elif ingresos > 1500:
        score += 10
        
    # 2. Factor Ubicación (Ejemplo simple)
    # Aquí podrías tener una lista de distritos "Top"
    zonas_top = ["San Isidro", "Miraflores", "San Borja", "Surco"]
    if user.direccion:
        if any(zona in user.direccion for zona in zonas_top):
            score += 20
            
    # 3. Factor Edad (Preferencia 25-50 años)
    if user.fecha_nacimiento:
        today = date.today()
        edad = today.year - user.fecha_nacimiento.year
        if 25 <= edad <= 50:
            score += 15
            
    # 4. Factor Interés (Consentimiento)
    if client.consentimiento_datos:
        score += 15

    return min(score, 100) # Máximo 100 puntos

# --- Endpoint ---
@router.get("/leads", response_model=List[OpportunityRead])
def get_leads(
    filtro_estado: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Solo administradores o asesores pueden ver esto
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No autorizado para ver leads")

    # Query base: Usuarios que tienen ficha de cliente
    query = db.query(User).join(Client).filter(User.client != None)
    
    if filtro_estado:
        query = query.filter(Client.estado_seguimiento == filtro_estado)
        
    users = query.all()
    
    opportunities = []
    
    for u in users:
        c = u.client
        score_calculado = calcular_score(u, c)
        
        # Determinar etiqueta textual
        if score_calculado >= 70:
            prob = "ALTA"
        elif score_calculado >= 40:
            prob = "MEDIA"
        else:
            prob = "BAJA"

        opportunities.append({
            "id_cliente": c.id_cliente,
            "nombre_completo": f"{u.nombres} {u.apellidos}",
            "email": u.email,
            "telefono": u.telefono,
            "direccion": u.direccion,
            "ingresos": c.ingresos_mensuales,
            "estado_seguimiento": c.estado_seguimiento,
            "notas": c.notas_seguimiento,
            "score": score_calculado,
            "probabilidad": prob
        })
    
    # Ordenar: Los de mayor score primero (Los mejores clientes arriba)
    opportunities.sort(key=lambda x: x["score"], reverse=True)
    
    return opportunities