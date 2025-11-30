import math
from .van_tir import calcular_tasa_mensual, calcular_van_interno, calcular_tir_interno

# --- 1. FUNCIÓN DE TABLA DE AMORTIZACIÓN ---
def generar_tabla_amortizacion(monto, 
                               tasa_interes_periodo, 
                               plazo_total_periodos, 
                               periodo_gracia_en_periodos, 
                               tipo_gracia,
                               tasa_seguro_desgrav_periodo=0.0,
                               seguro_bien_periodo=0.0,
                               portes_periodo=0.0):
    
    saldo = monto
    tabla = []
    
    # Periodo de gracia
    for periodo in range(1, periodo_gracia_en_periodos + 1):
        interes = saldo * tasa_interes_periodo
        seguro_desgravamen = saldo * tasa_seguro_desgrav_periodo
        
        if tipo_gracia == "total":
            amortizacion = 0
            cuota_credito = 0.0
            saldo += interes
            cuota_total_periodo = seguro_desgravamen + seguro_bien_periodo + portes_periodo
            flujo = -cuota_total_periodo 

        elif tipo_gracia == "parcial":
            amortizacion = 0
            cuota_credito = interes
            cuota_total_periodo = interes + seguro_desgravamen + seguro_bien_periodo + portes_periodo
            flujo = -cuota_total_periodo
        else: 
            amortizacion = 0; cuota_credito = 0; seguro_desgravamen = 0; cuota_total_periodo = 0; flujo = 0;
            
        tabla.append({
            "periodo": periodo,
            "cuota_total": cuota_total_periodo,
            "cuota_credito": cuota_credito,
            "interes": interes,
            "amortizacion": amortizacion,
            "seguro_desgravamen": seguro_desgravamen,
            "seguro_bien": seguro_bien_periodo,
            "portes": portes_periodo,
            "saldo": max(saldo, 0),
            "flujo": flujo
        })
    
    # Amortización regular
    plazo_amortizacion_periodos = plazo_total_periodos - periodo_gracia_en_periodos
    cuota_credito_fija = 0.0
    
    if plazo_amortizacion_periodos > 0:
        if tasa_interes_periodo > 0:
            factor = (1 + tasa_interes_periodo) ** plazo_amortizacion_periodos
            cuota_credito_fija = (saldo * tasa_interes_periodo * factor) / (factor - 1)
        else:
            cuota_credito_fija = saldo / plazo_amortizacion_periodos
    
    for periodo in range(periodo_gracia_en_periodos + 1, plazo_total_periodos + 1):
        interes = saldo * tasa_interes_periodo
        seguro_desgravamen = saldo * tasa_seguro_desgrav_periodo
        
        if periodo == plazo_total_periodos:
            amortizacion = saldo
            cuota_credito = amortizacion + interes
        else:
            cuota_credito = cuota_credito_fija
            amortizacion = cuota_credito - interes
        
        saldo -= amortizacion
        cuota_total_periodo = cuota_credito + seguro_desgravamen + seguro_bien_periodo + portes_periodo
        
        tabla.append({
            "periodo": periodo,
            "cuota_total": cuota_total_periodo,
            "cuota_credito": cuota_credito,
            "interes": interes,
            "amortizacion": amortizacion,
            "seguro_desgravamen": seguro_desgravamen,
            "seguro_bien": seguro_bien_periodo,
            "portes": portes_periodo,
            "saldo": max(saldo, 0),
            "flujo": -cuota_total_periodo
        })
        
    return tabla, cuota_credito_fija


# --- 2. FUNCIÓN PRINCIPAL DE SIMULACIÓN ---

def simulate_credit(data):
    try:
        FRECUENCIAS_PAGO = {
            "diaria": (1, 1/30),
            "quincenal": (15, 0.5),
            "mensual": (30, 1),
            "bimestral": (60, 2),
            "trimestral": (90, 3),
            "cuatrimestral": (120, 4),
            "semestral": (180, 6),
            "anual": (360, 12)
        }
        
        monto_financiado = data.monto - data.bono_techo_propio
        plazo_total_meses = data.plazo_meses
        frecuencia_str = getattr(data, "frecuencia_pago", "mensual")
        
        if frecuencia_str not in FRECUENCIAS_PAGO:
            raise ValueError(f"Frecuencia no soportada: {frecuencia_str}")
            
        dias_por_periodo, meses_por_periodo = FRECUENCIAS_PAGO[frecuencia_str]

        # --- TASAS ---
        tasa_mensual = calcular_tasa_mensual(data.tasa, data.tipo_tasa, data.capitalizacion)
        tasa_diaria = (1 + tasa_mensual) ** (1/30) - 1
        
        # Esta es la tasa "pura" del préstamo (sin gastos)
        tasa_interes_periodo = (1 + tasa_diaria) ** dias_por_periodo - 1
        
        # --- COSTOS ---
        pct_seg_desgrav_mensual = getattr(data, "pct_seguro_desgravamen_anual", 0.0)
        tasa_seguro_mensual_decimal = pct_seg_desgrav_mensual / 100
        tasa_seguro_desgrav_periodo = tasa_seguro_mensual_decimal * meses_por_periodo
        
        seguro_bien_monto_mensual = getattr(data, "seguro_bien_monto", 0.0)
        seguro_bien_periodo = seguro_bien_monto_mensual * meses_por_periodo
        
        portes_monto_mensual = getattr(data, "portes_monto", 0.0)
        portes_periodo = portes_monto_mensual * meses_por_periodo

        # --- PLAZOS ---
        plazo_total_periodos = int(math.ceil(plazo_total_meses / meses_por_periodo))
        periodo_gracia_meses = 0
        if data.gracia in ["total", "parcial"]:
            periodo_gracia_meses = 6
        periodo_gracia_en_periodos = int(math.ceil(periodo_gracia_meses / meses_por_periodo))
        
        # --- GENERAR TABLA ---
        tabla, cuota_credito_fija = generar_tabla_amortizacion(
            monto_financiado, tasa_interes_periodo, plazo_total_periodos, 
            periodo_gracia_en_periodos, data.gracia,
            tasa_seguro_desgrav_periodo, seguro_bien_periodo, portes_periodo
        )
        
        # --- FILA INICIAL ---
        gastos_iniciales = getattr(data, "gastos_iniciales", 0.0)
        flujo_inicial = monto_financiado - gastos_iniciales

        tabla.insert(0, {
            "periodo": 0, "cuota_total": 0.0, "cuota_credito": 0.0, "interes": 0.0,
            "amortizacion": 0.0, "seguro_desgravamen": 0.0, "seguro_bien": 0.0,
            "portes": 0.0, "saldo": monto_financiado, "flujo": flujo_inicial
        })
        
        # --- CÁLCULOS AVANZADOS (VAN / TIR / TCEA) ---
        flujos_caja_cliente = [fila["flujo"] for fila in tabla]
        
        # 1. TIR Período (Mensual/Periódica)
        guess = tasa_interes_periodo if tasa_interes_periodo > 0 else 0.01
        tir_periodo_decimal = calcular_tir_interno(flujos_caja_cliente, guess=guess)
        
        # Variables de salida
        tcea_valor = 0.0
        tir_mensual_valor = 0.0
        
        if tir_periodo_decimal is not None:
            # Convertimos a porcentaje para mostrarlo (ej: 0.008 -> 0.8%)
            tir_mensual_valor = tir_periodo_decimal * 100
            
            # Anualizamos para obtener la TCEA
            periodos_ano_tir = 360 / dias_por_periodo
            tcea_valor = ((1 + tir_periodo_decimal) ** periodos_ano_tir - 1) * 100

        # 2. VAN Cliente (Perspectiva prestatario: Recibe +, Paga -)
        # El resultado suele ser negativo, indicando el costo financiero total
        van_cliente = calcular_van_interno(flujos_caja_cliente, tasa_interes_periodo)
        
        # 3. VAN Banco (Perspectiva inversionista: Presta -, Cobra +)
        # Invertimos los signos: el préstamo es salida, las cuotas son entrada.
        flujos_caja_banco = [-f for f in flujos_caja_cliente]
        van_banco = calcular_van_interno(flujos_caja_banco, tasa_interes_periodo)
        
        # --- RETORNO ---
        total_pagado = sum(fila["cuota_total"] for fila in tabla[1:])
        intereses_pagados = sum(fila["interes"] for fila in tabla[1:])
        total_amortizacion = monto_financiado
        
        return {
            "frecuencia_pago": frecuencia_str,
            "numero_de_periodos": plazo_total_periodos,
            "cuota_credito_fija_por_periodo": round(cuota_credito_fija, 2) if periodo_gracia_en_periodos < plazo_total_periodos else 0,
            "primera_cuota_total": round(tabla[1]["cuota_total"], 2) if len(tabla) > 1 else 0,
            "total_pagado": round(total_pagado, 2),
            "intereses_pagados": round(intereses_pagados, 2),
            "total_amortizacion": round(total_amortizacion, 2),
            "tasa_efectiva_mensual": round(tasa_mensual * 100, 6),
            "tasa_efectiva_periodo": round(tasa_interes_periodo * 100, 6),
            
            # === NUEVOS CAMPOS ===
            "van_cliente": round(van_cliente, 2),
            "van_banco": round(van_banco, 2),       # Nuevo
            "tir_mensual": round(tir_mensual_valor, 6), # Nuevo
            "tcea": round(tcea_valor, 2),           # Nuevo (TIR anualizada)
            "tir_cliente": round(tcea_valor, 6),    # Mantener por compatibilidad si es necesario
            
            "tabla_amortizacion": [
                {
                    "periodo": fila["periodo"],
                    "cuota_total": round(fila["cuota_total"], 2),
                    "cuota_credito_pi": round(fila["cuota_credito"], 2),
                    "interes": round(fila["interes"], 2),
                    "amortizacion": round(fila["amortizacion"], 2),
                    "seguro_desgravamen": round(fila["seguro_desgravamen"], 2),
                    "seguro_bien": round(fila["seguro_bien"], 2),
                    "portes": round(fila["portes"], 2),
                    "saldo": round(fila["saldo"], 2),
                    "flujo": round(fila["flujo"], 2),
                }
                for fila in tabla
            ]
        }
        
    except Exception as e:
        print(f"Error en simulate_credit: {e}")
        return {"error": str(e)}