from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError 
from pydantic import BaseModel
from datetime import date
import shutil
import os
import uuid

# Modelos
from app.models.user import User as UserModel
from app.models.client import Client as ClientModel
from app.schemas import UserCreate, UserRead, TokenResponse, UserUpdate

# Servicios y DB
from app.services.auth import (
    hash_password, verify_password,
    create_access_token, decode_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.database import get_db 

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

# 🔥 LECTURA DE URL PÚBLICA (Para subida de fotos)
# Si está en Render, usará https://credifacil-api.onrender.com
SERVER_URL = os.getenv("PUBLIC_HOST_URL", "http://localhost:8000")

# ==========================================
# ESQUEMA LOCAL (Para cambio de contraseña)
# ==========================================
class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

# ==========================================
# FUNCIONES AUXILIARES (CREATE USER)
# ==========================================

def get_user_by_username(db: Session, username: str):
    """Busca un usuario en la DB por nombre de usuario."""
    return db.query(UserModel).filter(UserModel.username == username).first()

def create_user_with_client(db: Session, user: UserCreate, is_admin: bool = False):
    """
    Crea un nuevo usuario Y su ficha de cliente vinculada.
    """
    hashed_password = hash_password(user.password)
    
    db_user = UserModel(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        nombres=user.nombre,
        apellidos=user.apellido,
        dni=user.dni,
        fecha_nacimiento=user.fecha_nacimiento,
        telefono=user.telefono,
        direccion=user.direccion,
        consentimiento_datos=user.consentimiento_datos,
        role="admin" if is_admin else "user",
        is_active=True
    )

    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user) 

        new_client = ClientModel(
            user_id=db_user.id,
            ingresos_mensuales=user.ingresos_mensuales,
            consentimiento_datos=user.consentimiento_datos
        )
        db.add(new_client)
        db.commit()
        
        return db_user

    except IntegrityError:
        db.rollback() 
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El usuario ya existe (DNI, Email o Username duplicado)."
        )
    except Exception as e:
        db.rollback()
        print(f"Error interno al registrar: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al crear el usuario."
        )

# ==========================================
# ENDPOINTS
# ==========================================

# --- Registro ---
@router.post("/register", status_code=201)
def register(user: UserCreate, db: Session = Depends(get_db)): 
    new_user = create_user_with_client(db, user)
    return {"msg": "Usuario creado exitosamente", "user_id": new_user.id}


# --- Login ---
@router.post("/token", response_model=TokenResponse)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    user = get_user_by_username(db, username=form_data.username)
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario inactivo")

    access_token = create_access_token(
        subject=user.username,
        extra={"role": user.role, "user_id": user.id} 
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }


# --- Obtener usuario actual (Dependencia) ---
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)): 
    try:
        payload = decode_token(token)
        username = payload.get("sub")
 
        if not username:
            raise HTTPException(status_code=401, detail="Token inválido")
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    user = get_user_by_username(db, username=username)
    
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Usuario inactivo o no existe")

    return user 


# --- PERFIL: Leer datos ---
@router.get("/me") 
def me(current_user=Depends(get_current_user)):
    user_data = UserRead.model_validate(current_user)
    return {"usuario": user_data}


# --- PERFIL: Actualizar datos ---
@router.put("/me", response_model=UserRead)
def update_me(
    user_update: UserUpdate, 
    db: Session = Depends(get_db), 
    current_user: UserModel = Depends(get_current_user)
):
    update_data = user_update.dict(exclude_unset=True)

    for key, value in update_data.items():
        if hasattr(current_user, key):
            setattr(current_user, key, value)

    try:
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="El email o username ya está en uso.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al actualizar: {str(e)}")

    return current_user


# --- SEGURIDAD: Cambiar Contraseña ---
@router.post("/change-password")
def change_password(
    pass_data: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    if not verify_password(pass_data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="La contraseña actual es incorrecta.")

    new_hashed_password = hash_password(pass_data.new_password)
    
    current_user.password_hash = new_hashed_password
    db.add(current_user)
    db.commit()

    return {"message": "Contraseña actualizada correctamente"}


# --- ADMIN: Listar usuarios ---
@router.get("/users", response_model=list[UserRead])
def list_users(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin": 
        raise HTTPException(status_code=403, detail="No autorizado")

    users = db.query(UserModel).all()
    return users


# --- SUBIR FOTO DE PERFIL ---
@router.post("/upload-avatar")
def upload_avatar(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    # 1. Validar que sea imagen
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")

    # 2. Generar nombre único
    extension = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{extension}"
    
    # 3. Definir ruta de guardado
    file_location = f"static/perfiles/{filename}" 
    
    # 4. Guardar el archivo en el disco
    try:
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar imagen: {e}")

    # 5. Construir la URL pública (USANDO LA VARIABLE DINÁMICA)
    public_url = f"{SERVER_URL}/{file_location}"

    # 6. Actualizar Usuario en BD
    current_user.foto_perfil = public_url
    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return {"url": public_url}


def get_current_active_user(current_user: UserModel = Depends(get_current_user)):
    """
    Dependencia para endpoints que requieren que el usuario esté activo.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Usuario inactivo")
    return current_user