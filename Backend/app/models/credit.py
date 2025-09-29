from pydantic import BaseModel
from typing import Optional

class CreditInput(BaseModel):
    monto: float
    tasa: float
    tipo_tasa: str  # "nominal" o "efectiva"
    capitalizacion: Optional[int] = None  # solo si es nominal
    plazo_meses: int
    moneda: str  # "PEN" o "USD"
    gracia: str  # "ninguna", "total", "parcial"
    bono_techo_propio: Optional[float] = 0.0

class CreditOutput(BaseModel):
    cuota_mensual: float
    total_pagado: float
    intereses_pagados: float