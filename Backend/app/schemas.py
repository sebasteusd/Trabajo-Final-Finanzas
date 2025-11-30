from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime

# ==========================================
# 1. ESQUEMAS DE CLIENTE (Datos Financieros)
# ==========================================
class ClientBase(BaseModel):
    ingresos_mensuales: Optional[float] = 0.0
    tipo_trabajador: Optional[str] = None
    
    # Agregamos estos al base para que estén disponibles siempre
    estado_civil: Optional[str] = None
    consentimiento_datos: bool = False

class ClientCreate(ClientBase):
    pass

class ClientRead(ClientBase):
    id_cliente: int
    user_id: int
    
    # === CAMPOS NUEVOS (Perfilado Progresivo) ===
    # Es vital ponerlos aquí para que el frontend los pueda leer al hacer F5
    antiguedad_laboral: Optional[int] = 0
    numero_hijos: Optional[int] = 0
    ahorro_inicial_disponible: Optional[float] = 0.0
    tiene_deudas_vigentes: Optional[bool] = False
    pago_mensual_deudas: Optional[float] = 0.0
    # === DECLARACIONES JURADAS (BFH) ===
    no_propiedad_previa: Optional[bool] = False
    no_bono_previo: Optional[bool] = False
    
    # Campos CRM (Opcionales para visualización)
    estado_seguimiento: Optional[str] = "NUEVO"
    scoring_credito: Optional[int] = 0

    class Config:
        from_attributes = True

class ClientUpdate(BaseModel):
    ingresos_mensuales: Optional[float] = None
    tipo_trabajador: Optional[str] = None
    
    # Nuevos campos opcionales para actualización
    estado_civil: Optional[str] = None
    antiguedad_laboral: Optional[int] = None
    numero_hijos: Optional[int] = None
    ahorro_inicial_disponible: Optional[float] = None
    tiene_deudas_vigentes: Optional[bool] = None
    pago_mensual_deudas: Optional[float] = None
    # === [NUEVOS] DECLARACIONES JURADAS BFH ===
    no_propiedad_previa: Optional[bool] = None
    no_bono_previo: Optional[bool] = None
    consentimiento_datos: Optional[bool] = None

    class Config:
        from_attributes = True

# ==========================================
# 2. ESQUEMAS DE USUARIO (Datos Personales)
# ==========================================

class UserBase(BaseModel):
    username: str
    email: EmailStr
    nombre: str
    apellido: str
    dni: str
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    consentimiento_datos: bool = False 

class UserCreate(UserBase):
    password: str
    ingresos_mensuales: Optional[float] = 0.0 

class UserRead(UserBase):
    id: int
    role: str
    is_active: bool
    fecha_creacion: Optional[datetime] = None
    foto_perfil: Optional[str] = None
    
    # Aquí se anida el ClientRead completo con los nuevos campos
    client: Optional[ClientRead] = None
    
    nombre: str = Field(validation_alias="nombres")
    apellido: str = Field(validation_alias="apellidos")

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    telefono: Optional[str] = None
    dni: Optional[str] = None
    direccion: Optional[str] = None
    
    email: Optional[str] = None 
    username: Optional[str] = None

    class Config:
        from_attributes = True

# ==========================================
# 3. ESQUEMAS DE TOKEN
# ==========================================
class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

class TokenResponse(Token):
    pass

# ==========================================
# 4. ESQUEMAS DE ENTIDADES FINANCIERAS
# ==========================================
class FinancialEntityBase(BaseModel):
    nombre: str
    tipo: str
    logo_url: Optional[str] = None
    tasa_referencial: float
    gastos_administrativos: float
    seguro_desgravamen: float
    seguro_inmueble: float

class FinancialEntityRead(FinancialEntityBase):
    id_entidad: int
    estado: str
    
    class Config:
        from_attributes = True

# ==========================================
# 5. ESQUEMAS DE INMUEBLES
# ==========================================

class PropertyPhotoRead(BaseModel):
    url_foto: str
    orden: int
    class Config:
        from_attributes = True

class PropertyBase(BaseModel):
    proyecto: str
    tipo_unidad: str
    area_m2: float
    precio_venta: float
    direccion: str
    lugar: str
    habitaciones: int
    banos: int
    descripcion: Optional[str] = None

class PropertyRead(PropertyBase):
    id_unidad: int
    moneda_venta: str
    estado: str
    fotos: List[PropertyPhotoRead] = []
    class Config:
        from_attributes = True

class PropertyPhotoCreate(BaseModel):
    url_foto: str

class PropertyCreate(PropertyBase):
    proyecto: Optional[str] = "Sin Proyecto" 
    url_foto: Optional[str] = None
    fotos: List[PropertyPhotoCreate] = []
    class Config:
        from_attributes = True

# ==========================================
# 6. ESQUEMAS DE SIMULACIÓN DE CRÉDITO
# ==========================================

class CreditSimulationInput(BaseModel):
    monto: float
    plazo_meses: int
    tasa: float
    tipo_tasa: str  
    capitalizacion: Optional[str] = None 
    frecuencia_pago: str = "mensual"
    gracia: str = "sin_gracia" 
    bono_techo_propio: Optional[float] = 0.0
    
    pct_seguro_desgravamen_anual: Optional[float] = 0.0
    seguro_bien_monto: Optional[float] = 0.0
    portes_monto: Optional[float] = 0.0
    gastos_iniciales: Optional[float] = 0.0
    
    cok: float = Field(default=0.0, description="Costo de Oportunidad")

    class Config:
        from_attributes = True

# ==========================================
# 7. ESQUEMAS PARA GUARDAR/LEER SIMULACIONES
# ==========================================

class SimulationCreate(BaseModel):
    id_unidad: Optional[int] = None
    id_entidad: Optional[int] = None
    
    nombre_producto_credito: str = "Crédito Hipotecario"
    concepto_temporal: str = "Propiedad"
    
    moneda: str = "PEN"
    valor_inmueble: float
    cuota_inicial: float
    monto_financiado: float
    plazo_anios: float 
    tasa_interes_aplicada: float
    cuota_mensual_estimada: float
    total_pagado: float
    
    # 🔥 NUEVO CAMPO: Aquí recibimos el JSON completo del formulario
    datos_input: Optional[Dict[str, Any]] = None 

class SimulationRead(BaseModel):
    id_simulacion: int
    fecha_simulacion: datetime
    
    concepto_temporal: str
    nombre_producto_credito: str
    monto_financiado: float
    
    valor_inmueble: float        
    cuota_inicial: float         
    tasa_interes_aplicada: float 
    
    cuota_mensual_estimada: float
    total_pagado: float
    plazo_anios: float
    moneda: str
    
    # 🔥 NUEVO CAMPO: Aquí devolvemos el JSON al frontend
    datos_input: Optional[Dict[str, Any]] = None 

    class Config:
        from_attributes = True