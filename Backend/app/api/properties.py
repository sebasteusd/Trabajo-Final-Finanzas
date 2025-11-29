from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
# Importamos tus modelos exactos
from app.models.property import Property, PropertyPhoto 
# Importamos los esquemas (incluyendo el nuevo PropertyCreate)
from app.schemas import PropertyRead, PropertyCreate 

router = APIRouter()

# --- RUTA GET (LEER) ---
@router.get("/", response_model=List[PropertyRead])
def get_properties(db: Session = Depends(get_db)):
    """
    Obtiene todas las propiedades disponibles.
    """
    properties = db.query(Property).filter(Property.estado == "disponible").all()
    return properties

# --- RUTA POST (CREAR) - ¡ESTA ES LA QUE TE FALTABA! ---
@router.post("/", status_code=status.HTTP_201_CREATED, response_model=PropertyRead)
def create_property(property_data: PropertyCreate, db: Session = Depends(get_db)):
    """
    Crea una nueva unidad inmobiliaria y guarda sus fotos.
    """
    # 1. Crear el objeto Property (excluyendo campos extra de fotos)
    # Usamos .dict() y exclude para no pasar 'fotos' ni 'url_foto' al modelo de BD directo
    prop_data_dict = property_data.dict(exclude={'fotos', 'url_foto'})
    
    new_property = Property(**prop_data_dict)
    
    # Asegurar estado por defecto si viene vacío
    if not new_property.estado:
        new_property.estado = "disponible"

    db.add(new_property)
    db.commit()
    db.refresh(new_property) # Obtenemos el id_unidad generado

    # 2. Guardar las fotos
    # Revisamos si viene la lista 'fotos' o el campo suelto 'url_foto'
    if property_data.fotos:
        for foto in property_data.fotos:
            new_photo = PropertyPhoto(
                url_foto=foto.url_foto,
                id_unidad=new_property.id_unidad,
                orden=0
            )
            db.add(new_photo)
    
    elif property_data.url_foto:
        # Fallback por si el frontend manda solo url_foto string
        new_photo = PropertyPhoto(
            url_foto=property_data.url_foto,
            id_unidad=new_property.id_unidad,
            orden=0
        )
        db.add(new_photo)

    db.commit()
    db.refresh(new_property)

    return new_property