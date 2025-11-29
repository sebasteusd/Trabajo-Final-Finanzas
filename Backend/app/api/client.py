from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.client import Client
from app.models.user import User
from app.schemas import ClientRead, ClientUpdate
from app.api.auth import get_current_user # Reusamos la dependencia de auth


router = APIRouter()

# --- ACTUALIZAR CLIENTE (Datos Financieros) ---
@router.put("/me", response_model=ClientRead)
def update_client_me(
    client_data: ClientUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Actualiza o crea la información financiera del usuario logueado.
    """
    # 1. Buscar si el usuario ya tiene ficha de cliente
    client = db.query(Client).filter(Client.user_id == current_user.id).first()

    # 2. Preparamos los datos limpios (sin nulos)
    update_data = client_data.dict(exclude_unset=True)

    if not client:
        # CASO A: No existe ficha (raro si se creó al registrar, pero posible en usuarios antiguos)
        # Creamos una nueva
        new_client = Client(user_id=current_user.id, **update_data)
        db.add(new_client)
        db.commit()
        db.refresh(new_client)
        return new_client

    else:
        # CASO B: Ya existe, actualizamos
        for key, value in update_data.items():
            if hasattr(client, key):
                setattr(client, key, value)
        
        try:
            db.add(client)
            db.commit()
            db.refresh(client)
            return client
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Error al actualizar cliente: {str(e)}")

# --- LEER CLIENTE (Opcional, útil para debug) ---
@router.get("/me", response_model=ClientRead)
def get_client_me(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Perfil financiero no encontrado")
    return client