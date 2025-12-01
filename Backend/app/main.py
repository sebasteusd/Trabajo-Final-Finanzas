from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

# --- Imports de Base de Datos y Modelos ---
from .database import engine, Base, SessionLocal
from app.models.user import User
from app.models import client as client_models 
from app.models import financial as financial_models
from app.models import property as property_models
from app.models import favorite as favorite_models
from app.models import simulation as simulation_models 
from app.models.client import Client 
# --- Imports de Servicios (Necesitamos el hasher) ---
from app.services.auth import hash_password 

# === 🔥 IMPORTACIÓN DEL SCRIPT DE POBIMIENTO (SEED) 🔥 ===
from .init_data import seed_db 
# =======================================================


# --- Imports de Routers ---
from app.api import favorites
from app.api import simulations as simulations_router
from app.api import properties
from app.api import client as client_router
from app.api import financial as financial_router 
from app.api.credit import router as credit_router
from app.api.auth import router as auth_router 
from app.api import opportunities

# ===========================================
# 1. FUNCIÓN: CREAR TABLAS (MANTENER)
# ===========================================
def create_tables():
    """Crea todas las tablas definidas en los modelos."""
    print("🛠️ Creando tablas en la base de datos...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas/verificadas.")

# ===========================================
# 2. FUNCIÓN: CREAR ADMIN POR DEFECTO (Seguro)
# ===========================================
def create_default_admin():
    """Crea el usuario admin y su perfil de cliente asociado si no existe en la BD."""
    
    from app.services.auth import hash_password
    from app.models.user import User 
    from app.models.client import Client
    
    db = SessionLocal()
    try:
        # ... (Tu lógica existente para crear el admin) ...
        admin = db.query(User).filter(User.username == "admin").first()
        
        if not admin:
            print("👤 Usuario admin no encontrado. Creándolo...")
            
            password_plano = "admin123"
            hashed_password = hash_password(password_plano)
            
            new_admin = User(
                username="admin",
                email="admin@credifacil.com",
                password_hash=hashed_password, 
                nombres="Administrador",
                apellidos="Sistema",
                dni="00000000",
                fecha_nacimiento="1990-01-01",
                telefono="0000000000",
                direccion="CrediFácil HQ",
                role="admin",
                is_active=True
            )
            db.add(new_admin)
            db.commit()
            db.refresh(new_admin) 

            # CREACIÓN DEL PERFIL DE CLIENTE ASOCIADO
            new_client_profile = Client(
                user_id=new_admin.id,
                ingresos_mensuales=99999.00,
                estado_seguimiento="EN PROCESO",
                no_propiedad_previa=True,
                no_bono_previo=True 
            )
            db.add(new_client_profile)
            db.commit()
            
            print(f"✅ Admin y perfil de cliente creado exitosamente.")
        else:
            print("✅ El usuario admin ya existe.")
            
    except Exception as e:
        print(f"⚠️ Error al verificar/crear admin: {e}")
    finally:
        db.close()

# ===========================================
# 3. LIFESPAN (Garantiza el orden de ejecución en el arranque)
# ===========================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- AL INICIAR ---
    
    # 1. Crear tablas (Si ya lo incluyes en seed_db, puedes omitir esta línea)
    create_tables()
    
    # 2. Crear admin (Ejecución segura, solo si no existe)
    create_default_admin() 
    
    # === 🔥 3. POBLAR DATOS INICIALES (Entidades Financieras / Propiedades) 🔥 ===
    print("--- Iniciando proceso de Seed de Datos Iniciales ---")
    seed_db()
    print("--- Finalizado Seed de Datos ---")
    
    yield
    # --- AL APAGAR ---
    print("🛑 Servidor apagándose...")

# ===========================================
# 4. INICIALIZACIÓN DE LA APP
# ===========================================
app = FastAPI(
    title="Simulador MiVivienda",
    lifespan=lifespan 
)

# Configuración de estáticos
os.makedirs("static/perfiles", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================================================
# 5. REGISTRO DE RUTAS
# ===============================================================
app.include_router(credit_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth")
app.include_router(properties.router, prefix="/api/properties", tags=["Properties"])
app.include_router(opportunities.router, prefix="/api/crm", tags=["CRM"]) 
app.include_router(favorites.router, prefix="/api/favorites", tags=["Favorites"])
app.include_router(client_router.router, prefix="/api/client", tags=["Client"])
app.include_router(simulations_router.router, prefix="/api/simulations", tags=["Simulaciones (Persistencia)"])
app.include_router(financial_router.router, prefix="/api/financial", tags=["Financial"])

@app.get("/")
def read_root():
    return {"message": "API Simulador MiVivienda funcionando 🚀"}