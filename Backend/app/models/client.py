from sqlalchemy import Column, Integer, Numeric, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Client(Base):
    __tablename__ = "clientes"

    id_cliente = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # --- DATOS BÁSICOS (Registro) ---
    ingresos_mensuales = Column(Numeric(12, 2), default=0)
    tipo_trabajador = Column(String(50), nullable=True) # Dependiente/Indep
    consentimiento_datos = Column(Boolean, default=False)

    # --- DATOS AVANZADOS (Perfilado Progresivo) ---
    # Estos se llenan DESPUÉS del registro, en la vista "Mi Perfil"
    
    # Estabilidad Laboral (en meses)
    antiguedad_laboral = Column(Integer, default=0, nullable=True) 
    
    # Carga Familiar
    estado_civil = Column(String(20), nullable=True) # Soltero, Casado, Conviviente
    numero_hijos = Column(Integer, default=0, nullable=True)
    
    # Capacidad de Ahorro
    ahorro_inicial_disponible = Column(Numeric(12, 2), default=0, nullable=True)
    
    # Salud Financiera (Auto-declarada)
    tiene_deudas_vigentes = Column(Boolean, default=False, nullable=True)
    pago_mensual_deudas = Column(Numeric(12, 2), default=0, nullable=True)

# === [NUEVOS] DECLARACIONES JURADAS BFH (Techo Propio) ===
    # El usuario debe marcar estas casillas en su perfil.
    no_propiedad_previa = Column(Boolean, default=False, nullable=True) # Requisito BFH 3
    no_bono_previo = Column(Boolean, default=False, nullable=True)      # Requisito BFH 4
    
    # CRM
    estado_seguimiento = Column(String(50), default="NUEVO") 
    notas_seguimiento = Column(Text, nullable=True)
    scoring_credito = Column(Integer, default=0)

    user = relationship("User", back_populates="client")
    simulaciones = relationship("Simulacion", back_populates="cliente")