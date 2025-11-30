from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

# --- Imports de Base de Datos ---
from .database import engine, Base, SessionLocal

# --- Imports de Modelos (Para que SQLAlchemy los registre) ---
from app.models import user as user_models
from app.models import client as client_models 
from app.models import financial as financial_models
from app.models import property as property_models
from app.models import favorite as favorite_models
from app.models import simulation as simulation_models 

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
# 1. FUNCIÓN: CREAR TABLAS
# ===========================================
def create_tables():
    """Crea todas las tablas definidas en los modelos."""
    print("🛠️ Creando tablas en la base de datos...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas/verificadas.")

# ===========================================
# 2. FUNCIÓN: CREAR ADMIN POR DEFECTO
# ===========================================
def create_default_admin():
    """Crea el usuario admin si no existe en la BD."""
    from app.models.user import User
    # Hash de "admin123" (Generado con bcrypt para evitar dependencias extra aquí)
    HASH_ADMIN = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWrn96pzvPnEyezRI.qKGyXv5Ju6o6"
    
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            print("👤 Usuario admin no encontrado. Creando...")
            new_admin = User(
                username="admin",
                email="admin@credifacil.com",
                password_hash=HASH_ADMIN,
                nombres="Administrador",
                apellidos="Sistema",
                role="admin",
                is_active=True
            )
            db.add(new_admin)
            db.commit()
            print("✅ Admin creado exitosamente: admin / admin123")
        else:
            print("✅ El usuario admin ya existe.")
    except Exception as e:
        print(f"⚠️ Error al verificar admin (puede ser normal en primer deploy): {e}")
    finally:
        db.close()

# ===========================================
# 3. LIFESPAN (Garantiza el orden de ejecución)
# ===========================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- AL INICIAR ---
    create_tables()       # 1. Primero tablas
    create_default_admin() # 2. Luego datos
    yield
    # --- AL APAGAR ---
    print("🛑 Servidor apagándose...")

# ===========================================
# 4. INICIALIZACIÓN DE LA APP
# ===========================================
app = FastAPI(
    title="Simulador MiVivienda",
    lifespan=lifespan # <--- AQUÍ SE CONECTA EL CICLO DE VIDA
)

# Configuración de estáticos (Carpetas para fotos)
os.makedirs("static/perfiles", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Configuración de CORS (Permitir conexiones del frontend)
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