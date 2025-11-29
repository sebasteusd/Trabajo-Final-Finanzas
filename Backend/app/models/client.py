from sqlalchemy import Column, Integer, Numeric, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Client(Base):
    __tablename__ = "clientes"

    id_cliente = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    ingresos_mensuales = Column(Numeric(12, 2), default=0)
    tipo_trabajador = Column(String, nullable=True) 
    estado_civil = Column(String, nullable=True)
    consentimiento_datos = Column(Boolean, default=False)

    estado_seguimiento = Column(String, default="NUEVO") 
    notas_seguimiento = Column(Text, nullable=True)
    scoring_credito = Column(Integer, default=0)

    user = relationship("User", back_populates="client")

    # === CAMBIO AQUÍ ===
    # Usamos el nuevo nombre corto "Simulacion"
    simulaciones = relationship("Simulacion", back_populates="cliente")