from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

# CAMBIO DE NOMBRE: De SimulacionCredito a Simulacion
class Simulacion(Base):
    __tablename__ = "simulaciones_credito"

    id_simulacion = Column(Integer, primary_key=True, index=True)
    
    # Relaciones
    id_cliente = Column(Integer, ForeignKey("clientes.id_cliente"), nullable=False)
    id_entidad = Column(Integer, ForeignKey("entidades_financieras.id_entidad"), nullable=True)
    id_unidad = Column(Integer, ForeignKey("unidades_inmobiliarias.id_unidad"), nullable=True)

    fecha_simulacion = Column(DateTime(timezone=True), server_default=func.now())
    
    # Datos Snapshot
    nombre_producto_credito = Column(String, nullable=False) 
    moneda = Column(String, default="PEN")
    valor_inmueble = Column(Float, nullable=False)
    cuota_inicial = Column(Float, nullable=False)
    monto_financiado = Column(Float, nullable=False)
    plazo_anios = Column(Integer, nullable=False)
    tasa_interes_aplicada = Column(Float, nullable=False)
    cuota_mensual_estimada = Column(Float, nullable=False)
    
    concepto_temporal = Column(String, default="Propiedad")
    is_active = Column(Boolean, default=True)

    # Relación Inversa (Ahora apunta a "Client")
    cliente = relationship("Client", back_populates="simulaciones")