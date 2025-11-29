from sqlalchemy import Column, Integer, String, Numeric, Text, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Property(Base):
    __tablename__ = "unidades_inmobiliarias"

    id_unidad = Column(Integer, primary_key=True, index=True)
    proyecto = Column(String(150))
    tipo_unidad = Column(String(50)) # Departamento, Casa
    
    # Medidas y Precios
    area_m2 = Column(Numeric(10, 2))
    precio_venta = Column(Numeric(14, 2))
    precio_lista = Column(Numeric(14, 2))
    moneda_venta = Column(String(3), default="PEN") # PEN o USD
    
    # Ubicación y Estado
    estado = Column(String(20), default="disponible")
    direccion = Column(String(255))
    lugar = Column(String(100)) # Distrito (Ej: San Isidro)
    
    # Detalles
    habitaciones = Column(Integer)
    banos = Column(Integer)
    descripcion = Column(Text)
    caracteristicas = Column(Text) # Podríamos usar JSON si la BD lo soporta bien
    
    # Relación con fotos
    fotos = relationship("PropertyPhoto", back_populates="propiedad", cascade="all, delete-orphan")

class PropertyPhoto(Base):
    __tablename__ = "fotos_unidades"

    id_foto = Column(Integer, primary_key=True, index=True)
    id_unidad = Column(Integer, ForeignKey("unidades_inmobiliarias.id_unidad"))
    url_foto = Column(String(500))
    orden = Column(Integer, default=0)

    propiedad = relationship("Property", back_populates="fotos")