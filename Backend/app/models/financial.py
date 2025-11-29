from sqlalchemy import Column, Integer, String, Numeric, DateTime, func
from ..database import Base

class FinancialEntity(Base):
    __tablename__ = "entidades_financieras"

    id_entidad = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False) # BCP, BBVA, etc.
    tipo = Column(String(50)) # banco, caja
    logo_url = Column(String(255)) 
    
    # Tasas (Decimales para precisión)
    # Ejemplo: 0.1050 = 10.50%
    tasa_referencial = Column(Numeric(6, 4)) 
    tasa_moratoria = Column(Numeric(6, 4))
    
    # Seguros y Gastos
    gastos_administrativos = Column(Numeric(10, 2)) # S/ 20.00
    seguro_desgravamen = Column(Numeric(6, 4))    # % mensual
    seguro_inmueble = Column(Numeric(6, 4))       # % mensual
    
    estado = Column(String(20), default="activo")
    fecha_actualizacion = Column(DateTime(timezone=True), server_default=func.now())