from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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