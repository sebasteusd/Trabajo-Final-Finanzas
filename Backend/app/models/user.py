from datetime import date
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    username: str
    password: str
    nombre: str
    apellido: str
    dni: str = Field(..., min_length=8, max_length=12)
    fecha_nacimiento: date
    telefono: str
    email: EmailStr
    direccion: str
    info_socieconomico: str
    consentimiento_datos: bool

class UserLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  

class ClientCreate(BaseModel):
    nombre: str
    apellido: str
    
