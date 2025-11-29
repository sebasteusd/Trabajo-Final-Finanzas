from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Favorite(Base):
    __tablename__ = "favoritos"

    id_favorito = Column(Integer, primary_key=True, index=True)
    
    # CORRECCIÓN: Ahora apunta correctamente a la tabla 'users' y su columna 'id'
    id_usuario = Column(Integer, ForeignKey("users.id")) 
    
    # Esta parte estaba bien si tu tabla de propiedades es 'unidades_inmobiliarias'
    id_unidad = Column(Integer, ForeignKey("unidades_inmobiliarias.id_unidad"))
    
    fecha_agregado = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones para acceder a los objetos completos
    usuario = relationship("User", backref="favoritos")
    propiedad = relationship("Property", backref="favoritos")