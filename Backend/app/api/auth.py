# app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from app.models.user import UserCreate, TokenResponse
from app.services.auth import (
    hash_password, verify_password,
    create_access_token, decode_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

# Base de datos simulada en memoria
fake_db = {
    "admin": {
        "password_hash": hash_password("admin123"),
        "is_active": True,
        "role": "admin"
    }
}

# --- Registro ---
@router.post("/register", status_code=201)
def register(user: UserCreate):
    if user.username in fake_db:
        raise HTTPException(status_code=400, detail="Usuario ya existe")
    pwd_hash = hash_password(user.password)
    fake_db[user.username] = {
        "password_hash": pwd_hash,
        "is_active": True,
        "role": "user"  # por defecto todos son "user"
    }
    return {"msg": "Usuario creado"}


# --- Login (genera access token) ---
@router.post("/token", response_model=TokenResponse)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = fake_db.get(form_data.username)
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")

    # token incluye username y rol
    access_token = create_access_token(
        subject=form_data.username,
        extra={"role": user["role"]}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }


# --- Obtener usuario actual ---
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_token(token)
        username = payload.get("sub")
        role = payload.get("role")
        if not username:
            raise HTTPException(status_code=401, detail="Token inválido")
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    user = fake_db.get(username)
    if not user or not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Usuario inactivo o no existe")

    return {"username": username, "role": role}


# --- Ruta protegida para usuarios ---
@router.get("/me")
def me(current_user=Depends(get_current_user)):
    return {"usuario": current_user}


# --- Ruta protegida solo para admin ---
@router.get("/users")
def list_users(current_user=Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")

    return [
        {"username": u, "password_hash": data["password_hash"], "role": data["role"]}
        for u, data in fake_db.items()
    ]
