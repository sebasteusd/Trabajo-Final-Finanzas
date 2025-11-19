import math

# --- 1. FUNCIÓN DE CÁLCULO DE TASA MENSUAL (TEM) ---

def calcular_tasa_mensual(tasa, tipo_tasa, capitalizacion):
    """
    Calcula la tasa mensual efectiva (TEM) según el tipo de tasa y capitalización.
    """
    if tipo_tasa == "efectiva":
        # Tasa Efectiva Anual -> Convertir a mensual
        tasa_efectiva_anual = tasa / 100
        return (1 + tasa_efectiva_anual) ** (1 / 12) - 1
        
    elif tipo_tasa == "nominal":
        if capitalizacion is None:
            raise ValueError("Para tasa nominal se requiere capitalización")
        
        tasa_nominal_anual = tasa / 100
        
        if capitalizacion == "diaria":
            periodos_por_año = 360
        elif capitalizacion == "quincenal":
            periodos_por_año = 24
        elif capitalizacion == "mensual":
            periodos_por_año = 12
        elif capitalizacion == "bimestral":
            periodos_por_año = 6
        elif capitalizacion == "trimestral":
            periodos_por_año = 4
        elif capitalizacion == "cuatrimestral":
            periodos_por_año = 3
        elif capitalizacion == "semestral":
            periodos_por_año = 2
        elif capitalizacion == "anual":
            periodos_por_año = 1
        else:
            raise ValueError(f"Capitalización no soportada: {capitalizacion}")
        
        # 1. Calcular la Tasa del Período
        tasa_periodo = tasa_nominal_anual / periodos_por_año
        
        # Caso especial: Si capitaliza mensual, la tasa de período ES la tasa mensual.
        if capitalizacion == "mensual":
            return tasa_periodo
        
        # Para TODAS las demás capitalizaciones (diaria, trimestral, semestral, etc.):
        # 2. Convertimos a Tasa Efectiva Anual (TEA)
        tasa_efectiva_anual = (1 + tasa_periodo) ** periodos_por_año - 1
        
        # 3. Convertimos la TEA a Tasa Efectiva Mensual (TEM)
        tasa_mensual_efectiva = (1 + tasa_efectiva_anual) ** (1/12) - 1
        
        return tasa_mensual_efectiva
            
    else:
        raise ValueError("Tipo de tasa inválido. Use 'efectiva' o 'nominal'")

# --- 2. FUNCIÓN DE TABLA DE AMORTIZACIÓN (POR PERÍODOS) ---

def generar_tabla_amortizacion(monto, 
                               tasa_interes_periodo, 
                               plazo_total_periodos, 
                               periodo_gracia_en_periodos, 
                               tipo_gracia,
                               tasa_seguro_desgrav_periodo=0.0,
                               seguro_bien_periodo=0.0,
                               portes_periodo=0.0):
    """
    Genera la tabla de amortización basada en PERÍODOS de pago.
    """
    saldo = monto
    tabla = []
    
    # Periodo de gracia (en períodos)
    for periodo in range(1, periodo_gracia_en_periodos + 1):
        interes = saldo * tasa_interes_periodo
        seguro_desgravamen = saldo * tasa_seguro_desgrav_periodo
        
        if tipo_gracia == "total":
            amortizacion = 0
            cuota_credito = 0.0 # Cuota (P+I) es cero
            saldo += interes  # Capitalización de intereses
            cuota_total_periodo = seguro_desgravamen + seguro_bien_periodo + portes_periodo
            flujo = -cuota_total_periodo

        elif tipo_gracia == "parcial":
            amortizacion = 0
            cuota_credito = interes # Cuota (P+I) es solo el interés
            cuota_total_periodo = interes + seguro_desgravamen + seguro_bien_periodo + portes_periodo
            flujo = -cuota_total_periodo
        else: 
            amortizacion = 0; cuota_credito = 0; seguro_desgravamen = 0; cuota_total_periodo = 0; flujo = 0;
            
        tabla.append({
            "periodo": periodo,
            "cuota_total": cuota_total_periodo,
            "cuota_credito": cuota_credito, # (Capital + Interés)
            "interes": interes,
            "amortizacion": amortizacion,
            "seguro_desgravamen": seguro_desgravamen,
            "seguro_bien": seguro_bien_periodo,
            "portes": portes_periodo,
            "saldo": max(saldo, 0),
            "flujo": flujo
        })
    
    # Calcular cuota FIJA (Capital + Interés) para el periodo de amortización
    plazo_amortizacion_periodos = plazo_total_periodos - periodo_gracia_en_periodos
    cuota_credito_fija = 0.0
    
    if plazo_amortizacion_periodos > 0:
        if tasa_interes_periodo > 0:
            factor = (1 + tasa_interes_periodo) ** plazo_amortizacion_periodos
            cuota_credito_fija = (saldo * tasa_interes_periodo * factor) / (factor - 1)
        else:
            cuota_credito_fija = saldo / plazo_amortizacion_periodos
    
    # Periodo de amortización
    for periodo in range(periodo_gracia_en_periodos + 1, plazo_total_periodos + 1):
        interes = saldo * tasa_interes_periodo
        seguro_desgravamen = saldo * tasa_seguro_desgrav_periodo
        
        # Ajuste preciso de última cuota
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
            "cuota_credito": cuota_credito, # (Capital + Interés)
            "interes": interes,
            "amortizacion": amortizacion,
            "seguro_desgravamen": seguro_desgravamen,
            "seguro_bien": seguro_bien_periodo,
            "portes": portes_periodo,
            "saldo": max(saldo, 0),
            "flujo": -cuota_total_periodo
        })
        
    return tabla, cuota_credito_fija

# --- 3. FUNCIÓN PRINCIPAL DE SIMULACIÓN ---

def simulate_credit(data):
    """
    Simula un crédito con diferentes frecuencias de pago y costos.
    'data' es un objeto o diccionario con todos los parámetros.
    """
    try:
        # Mapa de frecuencias de pago (en días y meses equivalentes, base 30/360)
        FRECUENCIAS_PAGO = {
            # "nombre": (días_por_periodo, meses_por_periodo)
            "diaria": (1, 1/30),
            "quincenal": (15, 0.5),
            "mensual": (30, 1),
            "bimestral": (60, 2),
            "trimestral": (90, 3),
            "cuatrimestral": (120, 4),
            "semestral": (180, 6),
            "anual": (360, 12)
        }
        
        # --- 1. Obtener datos de entrada ---
        # Asumimos que 'data' es un objeto que permite acceso tipo 'data.monto'
        monto_financiado = data.monto - data.bono_techo_propio
        plazo_total_meses = data.plazo_meses
        
        # Obtener frecuencia de pago del objeto data, default a "mensual"
        frecuencia_str = getattr(data, "frecuencia_pago", "mensual")
        if frecuencia_str not in FRECUENCIAS_PAGO:
            raise ValueError(f"Frecuencia de pago no soportada: {frecuencia_str}")
            
        dias_por_periodo, meses_por_periodo = FRECUENCIAS_PAGO[frecuencia_str]

        # --- 2. Calcular Tasa de Interés del Período ---
        # Primero, obtenemos la Tasa Efectiva Mensual (TEM)
        tasa_mensual = calcular_tasa_mensual(data.tasa, data.tipo_tasa, data.capitalizacion)
        
        # Convertir TEM a Tasa Efectiva Diaria (TED), asumiendo 30 días/mes
        tasa_diaria = (1 + tasa_mensual) ** (1/30) - 1
        
        # Convertir TED a Tasa Efectiva del Período
        tasa_interes_periodo = (1 + tasa_diaria) ** dias_por_periodo - 1
        
        # --- 3. Calcular Costos del Período ---
        # El seguro de desgravamen suele venir como % anual (ej: 0.5%)
        pct_seg_desgrav_anual = getattr(data, "pct_seguro_desgravamen_anual", 0.0)
        # Tasa de seguro para el período (interés simple, sobre saldo)
        tasa_seguro_desgrav_periodo = (pct_seg_desgrav_anual / 100) * (dias_por_periodo / 360)
        
        # El seguro del bien y portes suelen ser montos fijos mensuales
        seguro_bien_monto_mensual = getattr(data, "seguro_bien_monto", 0.0)
        seguro_bien_periodo = seguro_bien_monto_mensual * meses_por_periodo
        
        portes_monto_mensual = getattr(data, "portes_monto", 0.0)
        portes_periodo = portes_monto_mensual * meses_por_periodo

        # --- 4. Calcular Plazos en Períodos ---
        # Usamos math.ceil para asegurar que el último período se incluya
        plazo_total_periodos = int(math.ceil(plazo_total_meses / meses_por_periodo))
        
        periodo_gracia_meses = 0
        if data.gracia == "total":
            periodo_gracia_meses = 6
        elif data.gracia == "parcial":
            periodo_gracia_meses = 6
        
        periodo_gracia_en_periodos = int(math.ceil(periodo_gracia_meses / meses_por_periodo))
        
        # --- 5. Generar la tabla ---
        tabla, cuota_credito_fija = generar_tabla_amortizacion(
            monto_financiado, 
            tasa_interes_periodo, 
            plazo_total_periodos, 
            periodo_gracia_en_periodos, 
            data.gracia,
            tasa_seguro_desgrav_periodo,
            seguro_bien_periodo,
            portes_periodo
        )
        
        # --- 6. Agregar fila inicial (Periodo 0) ---
        tabla.insert(0, {
            "periodo": 0,
            "cuota_total": 0.0,
            "cuota_credito": 0.0,
            "interes": 0.0,
            "amortizacion": 0.0,
            "seguro_desgravamen": 0.0,
            "seguro_bien": 0.0,
            "portes": 0.0,
            "saldo": monto_financiado,
            "flujo": monto_financiado
        })
        
        # --- 7. Calcular Totales ---
        total_pagado = sum(fila["cuota_total"] for fila in tabla[1:])
        intereses_pagados = sum(fila["interes"] for fila in tabla[1:])
        
        return {
            "frecuencia_pago": frecuencia_str,
            "numero_de_periodos": plazo_total_periodos,
            "cuota_credito_fija_por_periodo": round(cuota_credito_fija, 2) if periodo_gracia_en_periodos < plazo_total_periodos else 0,
            "primera_cuota_total": round(tabla[1]["cuota_total"], 2) if len(tabla) > 1 else 0,
            "total_pagado": round(total_pagado, 2),
            "intereses_pagados": round(intereses_pagados, 2),
            "tasa_efectiva_mensual": round(tasa_mensual * 100, 6),
            "tasa_efectiva_periodo": round(tasa_interes_periodo * 100, 6),
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
        # En un entorno de API, querrías devolver un JSON de error
        return {"error": str(e)}