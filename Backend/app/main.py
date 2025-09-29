from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.credit import router as credit_router

app = FastAPI(title="Simulador MiVivienda")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cambia a http://localhost:3000 si quieres restringir
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(credit_router, prefix="/api")