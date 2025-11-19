from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Literal
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

class FrecuenciaPago(str, Enum):
    diaria = "diaria"
    quincenal = "quincenal"
    mensual = "mensual"
    bimestral = "bimestral"
    trimestral = "trimestral"
    cuatrimestral = "cuatrimestral"
    semestral = "semestral"
    anual = "anual"

# --- 1. MODELO DE ENTRADA---


class CreditInput(BaseModel):
    monto: float
    tasa: float
    tipo_tasa: Literal["nominal", "efectiva"]
    capitalizacion: Optional[TipoCapitalizacion] = None # solo si es nominal
    plazo_meses: int
    moneda: str # "PEN" o "USD"
    gracia: TipoGracia
    bono_techo_propio: Optional[float] = 0.0
    
    # Campos que faltaban y que React sí envía
    frecuencia_pago: FrecuenciaPago
    pct_seguro_desgravamen_anual: float
    seguro_bien_monto: float
    portes_monto: float

# --- 2. MODELOS DE SALIDA ---

class AmortizationRow(BaseModel):
    """
    Define la estructura de CADA FILA en la tabla de amortización
    (Coincide con la tabla de React)
    """
    periodo: int
    cuota_total: float
    cuota_credito_pi: float
    interes: float
    amortizacion: float
    seguro_desgravamen: float
    seguro_bien: float
    portes: float
    saldo: float
    flujo: float

class CreditOutput(BaseModel):
    """
    Define la estructura de la RESPUESTA COMPLETA de la simulación
    """
    frecuencia_pago: str
    numero_de_periodos: int
    cuota_credito_fija_por_periodo: float
    primera_cuota_total: float
    total_pagado: float
    intereses_pagados: float
    tasa_efectiva_mensual: float
    tasa_efectiva_periodo: float
    tabla_amortizacion: List[AmortizationRow] 


# --- 3. ROUTER DE LA API ---

router = APIRouter()

@router.post("/simulate", response_model=CreditOutput)
def handle_simulation(data: CreditInput):
    """
    Recibe los datos del crédito, los valida con CreditInput,
    ejecuta la simulación y devuelve una respuesta 
    validada por CreditOutput.
    """
    try:
        # Llama a la lógica de simulación
        # 'data' es un objeto Pydantic validado
        result = simulate_credit(data)
        
        # FastAPI se asegurará automáticamente de que 'result'
        # coincida con la estructura de CreditOutput
        # antes de enviarlo.
        return result
        
    except ValueError as e:
        # Captura errores de lógica (ej. "Frecuencia no soportada")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Captura cualquier otro error inesperado
        print(f"Error inesperado en simulación: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar la simulación.")