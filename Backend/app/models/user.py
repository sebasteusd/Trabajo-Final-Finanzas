from datetime import date
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import Column, Integer, String, Boolean, Date

from ..database import Base 
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    # Campos principales
    id = Column(Integer, primary_key=True, index=True)
    
    # Campos de Autenticación 
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False) 
    role = Column(String(50), default="user", nullable=False) 
    is_active = Column(Boolean, default=True)

    # Campos de Información Personal
    nombre = Column(String(100))
    apellido = Column(String(100))
    dni = Column(String(15), unique=True)
    fecha_nacimiento = Column(Date)
    telefono = Column(String(20))
    email = Column(String(100), unique=True)
    direccion = Column(String(255))
    info_socieconomico = Column(String(255))
    consentimiento_datos = Column(Boolean)
    foto_perfil = Column(String(255), nullable=True)

    client = relationship("Client", back_populates="user", uselist=False) 

# ===================================================================
# MODELOS (Validación de datos)
# ===================================================================

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
    
class UserRead(BaseModel):
    username: str
    role: str
    nombre: str
    apellido: str
    dni: str
    fecha_nacimiento: date
    telefono: str
    email: EmailStr
    direccion: str
    info_socieconomico: str
    consentimiento_datos: bool
    is_active: bool

    foto_perfil: str | None = None
    
    class Config:
        from_attributes = True