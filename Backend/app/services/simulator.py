from app.services.van_tir import construir_flujo_cliente, calcular_van_tir

def calcular_tasa_mensual(tasa, tipo_tasa, capitalizacion):
    if tipo_tasa == "efectiva":
        return (1 + tasa / 100) ** (1 / 12) - 1
    elif tipo_tasa == "nominal":
        return (tasa / 100) / capitalizacion
    else:
        raise ValueError("Tipo de tasa inválido")

def generar_tabla_amortizacion(monto, tasa_mensual, plazo, cuota, periodo_gracia=0, tipo_gracia="ninguna"):
    saldo = monto
    tabla = []
    
    # Periodo de gracia
    for mes in range(1, periodo_gracia + 1):
        interes = saldo * tasa_mensual
        
        if tipo_gracia == "total":
            amortizacion = 0
            cuota_mes = 0
        elif tipo_gracia == "parcial":
            amortizacion = 0
            cuota_mes = interes
        else:  # sin gracia
            amortizacion = cuota - interes
            cuota_mes = cuota
            
        saldo -= amortizacion
        
        tabla.append({
            "mes": mes,
            "cuota": cuota_mes,
            "interes": interes,
            "amortizacion": amortizacion,
            "saldo": max(saldo, 0),
            "flujo": -cuota_mes
        })
    
    # Periodo de amortización
    plazo_amortizacion = plazo - periodo_gracia
    for mes in range(periodo_gracia + 1, plazo + 1):
        interes = saldo * tasa_mensual
        amortizacion = cuota - interes
        saldo -= amortizacion
        
        tabla.append({
            "mes": mes,
            "cuota": cuota,
            "interes": interes,
            "amortizacion": amortizacion,
            "saldo": max(saldo, 0),
            "flujo": -cuota
        })
    
    return tabla

def calcular_cuota_amortizacion(monto, tasa_mensual, plazo_amortizacion):
    """Calcula la cuota para el periodo de amortización (sin gracia)"""
    if plazo_amortizacion == 0:
        return 0
    factor = (1 + tasa_mensual) ** plazo_amortizacion
    cuota = (monto * tasa_mensual * factor) / (factor - 1)
    return cuota

def simulate_credit(data):
    monto_financiado = data.monto - data.bono_techo_propio
    tasa_mensual = calcular_tasa_mensual(data.tasa, data.tipo_tasa, data.capitalizacion)
    plazo_total = data.plazo_meses
    
    # Determinar periodo de gracia
    periodo_gracia = 0
    if data.gracia == "total":
        periodo_gracia = 6  # o el que definas
    elif data.gracia == "parcial":
        periodo_gracia = 6  # o el que definas
    
    plazo_amortizacion = plazo_total - periodo_gracia
    
    # Calcular cuota según el tipo de gracia
    if data.gracia == "total":
        # En gracia total: cuota = 0 durante gracia, luego cuota normal
        cuota_gracia = 0
        cuota_amortizacion = calcular_cuota_amortizacion(monto_financiado, tasa_mensual, plazo_amortizacion)
        cuota_final = cuota_amortizacion
        
    elif data.gracia == "parcial":
        # En gracia parcial: cuota = solo intereses durante gracia, luego cuota normal
        cuota_gracia = monto_financiado * tasa_mensual
        cuota_amortizacion = calcular_cuota_amortizacion(monto_financiado, tasa_mensual, plazo_amortizacion)
        cuota_final = cuota_amortizacion
        
    else:  # sin gracia
        cuota_gracia = 0
        cuota_amortizacion = calcular_cuota_amortizacion(monto_financiado, tasa_mensual, plazo_total)
        cuota_final = cuota_amortizacion
        periodo_gracia = 0
    
    # Generar tabla de amortización completa
    tabla = generar_tabla_amortizacion(
        monto_financiado, 
        tasa_mensual, 
        plazo_total, 
        cuota_amortizacion,  # cuota para amortización
        periodo_gracia, 
        data.gracia
    )
    
    # Agregar flujo inicial
    tabla.insert(0, {
        "mes": 0,
        "cuota": 0.0,
        "interes": 0.0,
        "amortizacion": 0.0,
        "saldo": monto_financiado,
        "flujo": monto_financiado  # El cliente RECIBE el dinero
    })
    
    # Construir flujo para VAN/TIR
    flujo = construir_flujo_cliente(monto_financiado, data.bono_techo_propio, tabla, data.gracia, periodo_gracia)
    van, tir = calcular_van_tir(flujo, tasa_descuento_mensual=tasa_mensual)
    
    # Calcular totales
    total_pagado = sum(fila["cuota"] for fila in tabla[1:])
    intereses_pagados = sum(fila["interes"] for fila in tabla[1:])
    
    return {
        "cuota_mensual": round(cuota_final, 2),
        "total_pagado": round(total_pagado, 2),
        "intereses_pagados": round(intereses_pagados, 2),
        "tabla_amortizacion": [
            {
                "mes": fila["mes"],
                "cuota": round(fila["cuota"], 2),
                "interes": round(fila["interes"], 2),
                "amortizacion": round(fila["amortizacion"], 2),
                "saldo": round(fila["saldo"], 2),
                "flujo": round(fila["flujo"], 2),
            }
            for fila in tabla
        ],
        "van_cliente": van,
        "tir_cliente": tir
    }