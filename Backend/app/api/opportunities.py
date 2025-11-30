from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import date

from app.database import get_db
from app.models.user import User
from app.models.client import Client
from app.api.auth import get_current_user 

router = APIRouter()

# --- Schemas ---
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
    probabilidad: str 

    class Config:
        from_attributes = True

# 🔥 ESQUEMA NUEVO PARA ACTUALIZAR NOTAS
class NoteUpdate(BaseModel):
    notas: str

# ==============================================================
# BASE DE DATOS DE ZONAS
# ==============================================================

ZONA_PREMIUM = [
    "San Isidro", "Miraflores", "San Borja", "La Molina", 
    "Santiago de Surco", "Barranco", "La Punta", "Santa María del Mar",
    "Punta Hermosa", "San Bartolo", "Punta Negra", "Asia"
]

ZONA_MEDIA_ALTA = [
    "Jesús María", "Magdalena del Mar", "Lince", "Pueblo Libre", 
    "San Miguel", "Surquillo", "Bellavista", "La Perla", "San Luis"
]

ZONA_EMERGENTE = [
    "Los Olivos", "San Martín de Porres", "Independencia", "Chorrillos", 
    "Ate", "Santa Anita", "La Victoria", "Breña", "Cercado de Lima", "Lima",
    "San Juan de Miraflores", "Callao", "Carmen de la Legua"
]

# ==============================================================
# LÓGICA DE SCORING PROFESIONAL (0 - 100 Pts)
# ==============================================================
def calcular_score(user: User, client: Client) -> int:
    score = 0
    
    # 1. CAPACIDAD DE PAGO
    ingresos = float(client.ingresos_mensuales or 0)
    pago_deudas = float(client.pago_mensual_deudas or 0)
    ingreso_neto = max(0, ingresos - pago_deudas)
    
    if ingreso_neto > 15000: score += 30
    elif ingreso_neto > 10000: score += 25
    elif ingreso_neto > 6000: score += 20
    elif ingreso_neto > 3500: score += 15
    elif ingreso_neto > 1500: score += 10
        
    # 2. UBICACIÓN
    direccion_completa = user.direccion or ""
    distrito = direccion_completa.split(" - ")[0].strip() if " - " in direccion_completa else direccion_completa
    
    if distrito in ZONA_PREMIUM: score += 20
    elif distrito in ZONA_MEDIA_ALTA: score += 15
    elif distrito in ZONA_EMERGENTE: score += 10
    else: 
        if len(direccion_completa) > 3: score += 5
            
    # 3. ESTABILIDAD LABORAL
    meses_trabajo = client.antiguedad_laboral or 0
    tipo_trabajo = (client.tipo_trabajador or "").lower()
    
    if meses_trabajo >= 24: score += 10    
    elif meses_trabajo >= 12: score += 8
    elif meses_trabajo >= 6: score += 5
    
    if "dependiente" in tipo_trabajo: score += 5

    # 4. CARGA FAMILIAR
    hijos = client.numero_hijos or 0
    estado_civil = (client.estado_civil or "").lower()
    
    if hijos == 0: score += 5
    elif hijos <= 2: score += 3
    
    if "casado" in estado_civil: score += 5

    # 5. SOLIDEZ FINANCIERA
    ahorro = float(client.ahorro_inicial_disponible or 0)
    if ahorro > 50000: score += 10
    elif ahorro > 20000: score += 5
    elif ahorro > 5000: score += 2

    # 6. FACTOR EDAD
    if user.fecha_nacimiento:
        today = date.today()
        edad = today.year - user.fecha_nacimiento.year
        
        if 30 <= edad <= 50: score += 10 
        elif 25 <= edad < 30: score += 7
        elif 51 <= edad <= 60: score += 5
        elif edad < 25: score += 3

    # 7. INTERÉS
    if client.consentimiento_datos:
        score += 5

    return min(score, 100)

# --- Endpoint GET LEADS ---
@router.get("/leads", response_model=List[OpportunityRead])
def get_leads(
    filtro_estado: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")

    query = db.query(User).join(Client).filter(User.client != None)
    
    if filtro_estado:
        query = query.filter(Client.estado_seguimiento == filtro_estado)
        
    users = query.all()
    opportunities = []
    
    for u in users:
        c = u.client
        score_calculado = calcular_score(u, c)
        
        if score_calculado >= 85: prob = "MUY ALTA"
        elif score_calculado >= 65: prob = "ALTA"
        elif score_calculado >= 45: prob = "MEDIA"
        else: prob = "BAJA"

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
    
    opportunities.sort(key=lambda x: x["score"], reverse=True)
    return opportunities

# --- 🔥 ENDPOINT NUEVO: GUARDAR NOTAS ---
@router.patch("/leads/{id_cliente}/notes")
def update_lead_notes(
    id_cliente: int,
    note_data: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")

    client = db.query(Client).filter(Client.id_cliente == id_cliente).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Guardamos la nota
    client.notas_seguimiento = note_data.notas
    
    # Automatización: Si es NUEVO y escribes una nota, pasa a EN PROCESO
    if client.estado_seguimiento == "NUEVO" and len(note_data.notas) > 5:
        client.estado_seguimiento = "EN PROCESO"

    db.commit()
    return {"message": "Nota actualizada correctamente"}