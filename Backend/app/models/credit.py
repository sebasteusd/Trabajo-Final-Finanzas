from pydantic import BaseModel
from typing import Optional, List

class CreditInput(BaseModel):
    monto: float
    tasa: float
    tipo_tasa: str  # "nominal" o "efectiva"
    capitalizacion: Optional[int] = None  # solo si es nominal
    plazo_meses: int
    moneda: str  # "PEN" o "USD"
    gracia: str  # "ninguna", "total", "parcial"
    bono_techo_propio: Optional[float] = 0.0

class AmortizationRow(BaseModel):
    mes: int
    cuota: float
    interes: float
    amortizacion: float
    saldo: float
    flujo: float  # nuevo campo para el flujo de caja del cliente

class CreditOutput(BaseModel):
    cuota_mensual: float
    total_pagado: float
    intereses_pagados: float
    tabla_amortizacion: List[AmortizationRow]
    van_cliente: Optional[float]
    tir_cliente: Optional[float]