from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.models.user import UserCreate, UserRead, TokenResponse, User as UserModel 
from app.services.auth import (
    hash_password, verify_password,
    create_access_token, decode_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.database import get_db 

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")



def get_user_by_username(db: Session, username: str):
    """Busca un usuario en la DB por nombre de usuario."""

    # Consulta a la tabla 'users'
    return db.query(UserModel).filter(UserModel.username == username).first()

def create_user(db: Session, user: UserCreate, is_admin: bool = False):
    """Crea un nuevo usuario en la base de datos."""
    hashed_password = hash_password(user.password)
    

    db_user = UserModel(
        username=user.username,
        password_hash=hashed_password,
        role="admin" if is_admin else "user",
        is_active=True,
        nombre=user.nombre,
        apellido=user.apellido,
        dni=user.dni,
        fecha_nacimiento=user.fecha_nacimiento,
        telefono=user.telefono,
        email=user.email,
        direccion=user.direccion,
        info_socieconomico=user.info_socieconomico,
        consentimiento_datos=user.consentimiento_datos
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Inicialización de Administrador  ---

with next(get_db()) as db:
    if not get_user_by_username(db, username="admin"):
        admin_data = UserCreate(
            username="admin", password="admin123", nombre="Admin", apellido="System", 
            dni="00000000", fecha_nacimiento="2000-01-01", telefono="0", 
            email="admin@credifacil.com", direccion="N/A", info_socieconomico="N/A",
            consentimiento_datos=True
        )
        create_user(db, admin_data, is_admin=True)
        print("--- Usuario 'admin' inicializado y guardado en SQL Server. ---")

# -------------------------------------------------------------

# --- Registro (Ruta POST) ---
@router.post("/register", status_code=201)
def register(user: UserCreate, db: Session = Depends(get_db)): 
    db_user = get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Usuario ya existe")
    
    new_user = create_user(db, user)
    return {"msg": "Usuario creado", "user_id": new_user.id}


# --- Login (Ruta POST) ---
@router.post("/token", response_model=TokenResponse)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    # 1. Buscar usuario en la DB
    user = get_user_by_username(db, username=form_data.username)
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")

    if not user.is_active:
         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario inactivo")

    # 2. Generar token
    access_token = create_access_token(
        subject=user.username,
        extra={"role": user.role} 
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }


# --- Obtener usuario actual  ---
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)): 
    try:
        payload = decode_token(token)
        username = payload.get("sub")
 
        if not username:
            raise HTTPException(status_code=401, detail="Token inválido")
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    # 1. Buscamos el usuario en la DB
    user = get_user_by_username(db, username=username)
    
    # 2. Validaciones
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Usuario inactivo o no existe")

    # Devolvemos el rol real y activo de la DB
    return {"username": user.username, "role": user.role}


# --- Ruta protegida para usuarios ---
@router.get("/me")
def me(current_user=Depends(get_current_user)):
    return {"usuario": current_user}


# --- Ruta protegida solo para admin ---
@router.get("/users", response_model=list[UserRead]) # ⬅️ Usamos Pydantic Model para la salida
def list_users(current_user=Depends(get_current_user), db: Session = Depends(get_db)): # ⬅️ Dependencia DB
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")

    # Consultamos todos los usuarios de la DB
    users = db.query(UserModel).all()
    
    # Usamos Pydantic para validar y formatear la salida antes de devolver
    return users