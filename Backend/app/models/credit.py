from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

class TipoCapitalizacion(str, Enum):
    diaria = "diaria"
    quincenal = "quincenal"
    mensual = "mensual"
    bimestral = "bimestral"
    trimestral = "trimestral"
    cuatrimestral = "cuatrimestral"
    semestral = "semestral"
    anual = "anual"

class TipoGracia(str, Enum):
    ninguna = "ninguna"
    parcial = "parcial"
    total = "total"

class CreditInput(BaseModel):
    monto: float
    tasa: float
    tipo_tasa: str  # "nominal" o "efectiva"
    capitalizacion: Optional[TipoCapitalizacion] = None  # solo si es nominal
    plazo_meses: int
    moneda: str  # "PEN" o "USD"
    gracia: TipoGracia
    bono_techo_propio: Optional[float] = 0.0

class AmortizationRow(BaseModel):
    mes: int
    cuota: float
    interes: float
    amortizacion: float
    saldo: float
    flujo: float

class CreditOutput(BaseModel):
    cuota_mensual: float
    total_pagado: float
    intereses_pagados: float
    tasa_mensual_efectiva: Optional[float]  # para debug/información
    tabla_amortizacion: List[AmortizationRow]
    van_cliente: Optional[float]
    tir_cliente: Optional[float]