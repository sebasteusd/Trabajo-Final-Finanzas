from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from fastapi.staticfiles import StaticFiles
import os
# Importamos los modelos para asegurar que se registren en SQLAlchemy
from app.models import user as user_models
from app.models import client as client_models 
from app.api import favorites
from app.models import financial as financial_models
from app.models import property as property_models
from app.models import favorite as favorite_models

from app.api import properties
from app.api import client as client_router
# --- 1. IMPORTAR EL NUEVO ROUTER AQUÍ ---
from app.api import financial as financial_router 

# ===========================================
# CREAR TABLAS
# ===========================================
def create_tables():
    """Crea todas las tablas definidas en los modelos."""
    Base.metadata.create_all(bind=engine)

create_tables()

# ===============================================================
# IMPORTAR ROUTERS
# ===============================================================
from app.api.credit import router as credit_router
from app.api.auth import router as auth_router 
from app.api import opportunities

app = FastAPI(title="Simulador MiVivienda")
os.makedirs("static/perfiles", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================================================
# REGISTRAR RUTAS
# ===============================================================

# Rutas existentes
app.include_router(credit_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth")
app.include_router(properties.router, prefix="/api/properties", tags=["Properties"])
app.include_router(opportunities.router, prefix="/api/crm", tags=["CRM"]) 
app.include_router(favorites.router, prefix="/api/favorites", tags=["Favorites"])
app.include_router(client_router.router, prefix="/api/client", tags=["Client"])

# --- 2. REGISTRAR LA RUTA AQUÍ ---
# Esto habilitará: http://localhost:8000/api/financial/entities
app.include_router(financial_router.router, prefix="/api/financial", tags=["Financial"])

@app.get("/")
def read_root():
    return {"message": "API Simulador MiVivienda funcionando"}