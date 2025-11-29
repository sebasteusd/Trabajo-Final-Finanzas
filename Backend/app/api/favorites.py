from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.favorite import Favorite
from app.models.property import Property
from app.models.user import User
from app.api.auth import get_current_user # Asegúrate de tener esta función de auth
from app.schemas import PropertyRead # Reusamos el esquema de propiedades para listar

router = APIRouter()

# 1. TOGGLE FAVORITO (Dar Like / Quitar Like)
@router.post("/{property_id}")
def toggle_favorite(
    property_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Verificar si ya existe
    existing_fav = db.query(Favorite).filter(
        Favorite.id_usuario == current_user.id,
        Favorite.id_unidad == property_id
    ).first()

    if existing_fav:
        # Si existe, lo borramos (Dislike)
        db.delete(existing_fav)
        db.commit()
        return {"message": "Eliminado de favoritos", "is_favorite": False}
    else:
        # Si no existe, lo creamos (Like)
        new_fav = Favorite(id_usuario=current_user.id, id_unidad=property_id)
        db.add(new_fav)
        db.commit()
        return {"message": "Agregado a favoritos", "is_favorite": True}

# 2. LISTAR FAVORITOS DEL USUARIO
@router.get("/", response_model=List[PropertyRead])
def get_my_favorites(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Hacemos un JOIN para obtener las PROPIEDADES que están en la tabla FAVORITOS
    favorites = db.query(Property).join(Favorite).filter(Favorite.id_usuario == current_user.id).all()
    return favorites