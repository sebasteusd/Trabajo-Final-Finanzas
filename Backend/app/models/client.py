from sqlalchemy import Column, Integer, Numeric, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..database import Base

class Client(Base):
    __tablename__ = "clientes"

    id_cliente = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Datos Financieros
    ingresos_mensuales = Column(Numeric(12, 2), default=0)
    tipo_trabajador = Column(String(50), nullable=True) 
    estado_civil = Column(String(20), nullable=True)
    consentimiento_datos = Column(Boolean, default=False)

    # === NUEVOS CAMPOS PARA SEGUIMIENTO (CRM) ===
    # Estados: 'NUEVO', 'CONTACTADO', 'INTERESADO', 'EN_EVALUACION', 'CERRADO', 'DESCARTADO'
    estado_seguimiento = Column(String(50), default="NUEVO") 
    
    # Notas del asesor (ej: "El cliente prefiere que lo llamen por la tarde")
    notas_seguimiento = Column(Text, nullable=True)
    
    # Score calculado (se puede actualizar periódicamente)
    scoring_credito = Column(Integer, default=0)

    user = relationship("User", back_populates="client")