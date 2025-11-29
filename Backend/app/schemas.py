from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel
from typing import Optional

# ==========================================
# 1. ESQUEMAS DE CLIENTE (Datos Financieros)
# ==========================================
class ClientBase(BaseModel):
    ingresos_mensuales: Optional[float] = 0.0
    tipo_trabajador: Optional[str] = None
    estado_civil: Optional[str] = None
    consentimiento_datos: bool = False

class ClientCreate(ClientBase):
    pass

class ClientRead(ClientBase):
    id_cliente: int
    user_id: int
    
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
    
    client: Optional[ClientRead] = None
    
    nombre: str = Field(validation_alias="nombres")
    apellido: str = Field(validation_alias="apellidos")

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
# 4. ESQUEMAS DE ENTIDADES FINANCIERAS (NUEVO)
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
# 5. ESQUEMAS DE INMUEBLES (NUEVO)
# ==========================================

# Esquema para las fotos dentro del inmueble
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
    
    # Aquí anidamos las fotos para que el frontend pueda mostrarlas en el carrusel
    fotos: List[PropertyPhotoRead] = []

    class Config:
        from_attributes = True

# Esquema para recibir una foto al crear
class PropertyPhotoCreate(BaseModel):
    url_foto: str

# Esquema para crear la propiedad (Hereda de PropertyBase pero hace opcionales ciertos campos)
class PropertyCreate(PropertyBase):
    # Hacemos 'proyecto' opcional porque en el formulario frontend no lo pedimos explícitamente
    proyecto: Optional[str] = "Sin Proyecto" 
    
    # Campos para recibir las fotos desde el frontend
    url_foto: Optional[str] = None
    fotos: List[PropertyPhotoCreate] = []

    class Config:
        from_attributes = True

# === AGREGA ESTA CLASE ===
class UserUpdate(BaseModel):
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    telefono: Optional[str] = None
    dni: Optional[str] = None
    direccion: Optional[str] = None
    
    # Opcionales si quieres permitir cambiarlos (cuidado con duplicados en BD)
    email: Optional[str] = None 
    username: Optional[str] = None

    class Config:
        from_attributes = True

# === AGREGA ESTO EN LA SECCIÓN DE CLIENTE ===
class ClientUpdate(BaseModel):
    ingresos_mensuales: Optional[float] = None
    tipo_trabajador: Optional[str] = None
    estado_civil: Optional[str] = None
    consentimiento_datos: Optional[bool] = None

    class Config:
        from_attributes = True

# ==========================================
# 6. ESQUEMAS DE SIMULACIÓN DE CRÉDITO (AGREGAR ESTO)
# ==========================================

class CreditSimulationInput(BaseModel):
    monto: float
    plazo_meses: int
    tasa: float
    tipo_tasa: str  # "efectiva" o "nominal"
    capitalizacion: Optional[str] = None # Solo si es nominal
    frecuencia_pago: str = "mensual"
    gracia: str = "sin_gracia" # "total", "parcial", "sin_gracia"
    bono_techo_propio: Optional[float] = 0.0
    
    # Costos adicionales para la tabla
    pct_seguro_desgravamen_anual: Optional[float] = 0.0
    seguro_bien_monto: Optional[float] = 0.0
    portes_monto: Optional[float] = 0.0
    gastos_iniciales: Optional[float] = 0.0
    
    # === CAMPO CRÍTICO PARA EL VAN ===
    # Si no envías esto, el VAN no funciona correctamente.
    cok: float = Field(default=0.0, description="Costo de Oportunidad (Tasa de Descuento Anual)")

    class Config:
        from_attributes = True

        