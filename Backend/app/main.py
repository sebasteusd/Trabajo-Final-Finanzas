from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from app.models import user as user_models
from app.models import client as client_models 

# ===========================================
# CREAR TABLAS ANTES DE CUALQUIER OTRA COSA 
# ===========================================

def create_tables():
    """Crea todas las tablas definidas en los modelos."""
    # Esto busca todas las clases que heredan de Base y las crea en la DB
    Base.metadata.create_all(bind=engine)

create_tables()

# ===============================================================
# PASO 2: IMPORTAR ROUTERS Y CONFIGURAR APP
# (Ahora que las tablas existen, podemos importar auth.py)
# ===============================================================
from app.api.credit import router as credit_router
from app.api.auth import router as auth_router 

app = FastAPI(title="Simulador MiVivienda")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(credit_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth")

# Ejemplo de ruta raíz
@app.get("/")
def read_root():
    return {"message": "API Simulador MiVivienda funcionando"}