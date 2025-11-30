from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field # <--- Importante agregar Field
from typing import Optional, List, Literal
from enum import Enum
# Importa tu función lógica (asegúrate que la ruta sea correcta)
# from app.services.simulator import simulate_credit 

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

# --- 1. MODELO DE ENTRADA ---

class CreditInput(BaseModel):
    monto: float
    tasa: float
    tipo_tasa: Literal["nominal", "efectiva"]
    capitalizacion: Optional[TipoCapitalizacion] = None # solo si es nominal
    plazo_meses: int
    moneda: str # "PEN" o "USD"
    gracia: TipoGracia
    bono_techo_propio: Optional[float] = 0.0
    
    # Campos que React envía
    frecuencia_pago: FrecuenciaPago
    pct_seguro_desgravamen_anual: float = 0.0
    seguro_bien_monto: float = 0.0
    portes_monto: float = 0.0
    gastos_iniciales: Optional[float] = 0.0


# --- 2. MODELOS DE SALIDA ---

class AmortizationRow(BaseModel):
    """
    Define la estructura de CADA FILA en la tabla de amortización
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
    Define la estructura de la RESPUESTA COMPLETA de la simulación.
    Cualquier campo que NO esté aquí, FastAPI lo borrará.
    """
    frecuencia_pago: str
    numero_de_periodos: int
    cuota_credito_fija_por_periodo: float
    primera_cuota_total: float
    total_pagado: float
    intereses_pagados: float
    tasa_efectiva_mensual: float
    tasa_efectiva_periodo: float
    
# === NUEVOS CAMPOS DE RENTABILIDAD ===
    van_cliente: Optional[float] = None
    van_banco: Optional[float] = None        # <--- NUEVO
    
    tir_mensual: Optional[float] = None      # <--- NUEVO (TIR Periodo)
    tcea: Optional[float] = None   # <--- Renombramos o mapeamos tir_cliente aquí
    
    is_techo_propio_eligible: bool
    techo_propio_status: str          
    
    tabla_amortizacion: List[AmortizationRow]


# --- 3. ROUTER DE LA API ---

router = APIRouter()

# Asegúrate de importar simulate_credit al principio del archivo si no está
# from app.services.simulator import simulate_credit

@router.post("/simulate", response_model=CreditOutput)
def handle_simulation(data: CreditInput):
    """
    Recibe los datos, calcula y devuelve SOLO los campos definidos en CreditOutput.
    """
    from app.services.simulator import simulate_credit # Importación local para evitar ciclos

    try:
        # data ya incluye data.cok gracias a CreditInput actualizado
        result = simulate_credit(data)
        
        # Validación extra por si la función devuelve error
        if isinstance(result, dict) and "error" in result:
             raise HTTPException(status_code=400, detail=result["error"])

        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error inesperado en simulación: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")