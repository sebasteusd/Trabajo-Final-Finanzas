from datetime import date
from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, Integer, String, Date, Boolean, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Client(Base):
    __tablename__ = "clientes"

    id_cliente = Column(Integer, primary_key=True, index=True)
    
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    
    # Campos de Cliente
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    tipo_documento = Column(String(20))
    documento = Column(String(20), unique=True, index=True, nullable=False)
    fecha_nacimiento = Column(Date)
    telefono = Column(String(20))
    correo = Column(String(100), unique=True, index=True, nullable=False)
    direccion = Column(String(255))
    ingresos_mensuales = Column(Numeric(10, 2))
    consentimiento_datos = Column(Boolean)

    # Definición de relaciones
    user = relationship("User", back_populates="client")
    
    #simulaciones = relationship("SimulacionCredito", back_populates="cliente")


# ===================================================================
# MODELOS para validación
# ===================================================================

class ClientCreate(BaseModel):
    nombres: str
    apellidos: str
    tipo_documento: str
    documento: str
    fecha_nacimiento: date
    telefono: str
    correo: EmailStr
    direccion: str
    ingresos_mensuales: float
    consentimiento_datos: bool

class ClientRead(ClientCreate):
    id_cliente: int
    user_id: int
    
    class Config:
        from_attributes = True