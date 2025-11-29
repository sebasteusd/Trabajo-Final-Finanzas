from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    
    # IMPORTANTE: Aquí en la BD usamos PLURAL
    nombres = Column(String(100), nullable=True)
    apellidos = Column(String(100), nullable=True)
    dni = Column(String(20), unique=True, index=True, nullable=True)
    fecha_nacimiento = Column(Date, nullable=True)
    telefono = Column(String(20), nullable=True)
    direccion = Column(String(255), nullable=True)
    
    role = Column(String(20), default="user") 
    foto_perfil = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    
    info_socieconomico = Column(String(255), nullable=True)
    consentimiento_datos = Column(Boolean, default=False)

    client = relationship("Client", back_populates="user", uselist=False, cascade="all, delete-orphan")