from app.services.van_tir import construir_flujo_cliente, calcular_van_tir

def calcular_tasa_mensual(tasa, tipo_tasa, capitalizacion):
    if tipo_tasa == "efectiva":
        return (1 + tasa / 100) ** (1 / 12) - 1
    elif tipo_tasa == "nominal":
        return (tasa / 100) / capitalizacion
    else:
        raise ValueError("Tipo de tasa inválido")

def generar_tabla_amortizacion(monto, tasa_mensual, plazo, periodo_gracia=0, tipo_gracia="ninguna"):
    saldo = monto
    tabla = []
    
    # Periodo de gracia
    for mes in range(1, periodo_gracia + 1):
        interes = saldo * tasa_mensual
        
        if tipo_gracia == "total":
            # Gracia TOTAL: no se paga nada, intereses se capitalizan
            amortizacion = 0
            cuota_mes = 0
            saldo += interes  # Capitalización de intereses
            flujo = 0
            
        elif tipo_gracia == "parcial":
            # Gracia PARCIAL: solo se pagan intereses
            amortizacion = 0
            cuota_mes = interes
            # Saldo se mantiene igual
            flujo = -cuota_mes
        else:  # sin gracia
            # Esto no debería ejecutarse para periodo_gracia > 0
            amortizacion = 0
            cuota_mes = 0
            flujo = 0
        
        tabla.append({
            "mes": mes,
            "cuota": cuota_mes,
            "interes": interes,
            "amortizacion": amortizacion,
            "saldo": max(saldo, 0),
            "flujo": flujo
        })
    
    # Calcular cuota para el periodo de amortización
    plazo_amortizacion = plazo - periodo_gracia
    if plazo_amortizacion > 0:
        factor = (1 + tasa_mensual) ** plazo_amortizacion
        cuota = (saldo * tasa_mensual * factor) / (factor - 1)
    else:
        cuota = 0
    
    # Periodo de amortización
    for mes in range(periodo_gracia + 1, plazo + 1):
        interes = saldo * tasa_mensual
        amortizacion = cuota - interes
        saldo -= amortizacion
        
        # Ajustar última cuota si es necesario
        cuota_ajustada = cuota
        if mes == plazo and abs(saldo) > 0.01:
            cuota_ajustada = interes + amortizacion + saldo
            saldo = 0
        
        tabla.append({
            "mes": mes,
            "cuota": cuota_ajustada,
            "interes": interes,
            "amortizacion": amortizacion,
            "saldo": max(saldo, 0),
            "flujo": -cuota_ajustada
        })
    
    return tabla, cuota

def simulate_credit(data):
    try:
        # Calcular monto financiado
        monto_financiado = data.monto - data.bono_techo_propio
        tasa_mensual = calcular_tasa_mensual(data.tasa, data.tipo_tasa, data.capitalizacion)
        plazo_total = data.plazo_meses
        
        # Determinar periodo de gracia
        periodo_gracia = 0
        if data.gracia == "total":
            periodo_gracia = 6  # 6 meses de gracia total
        elif data.gracia == "parcial":
            periodo_gracia = 6  # 6 meses de gracia parcial
        
        # Generar tabla de amortización completa
        tabla, cuota_final = generar_tabla_amortizacion(
            monto_financiado, 
            tasa_mensual, 
            plazo_total, 
            periodo_gracia, 
            data.gracia
        )
        
        # Agregar flujo inicial (mes 0)
        tabla.insert(0, {
            "mes": 0,
            "cuota": 0.0,
            "interes": 0.0,
            "amortizacion": 0.0,
            "saldo": monto_financiado,
            "flujo": monto_financiado  # El cliente RECIBE el dinero
        })
        
        # Construir flujo para VAN/TIR (SOLO 2 argumentos ahora)
        flujo = construir_flujo_cliente(monto_financiado, data.bono_techo_propio, tabla)
        van, tir = calcular_van_tir(flujo, tasa_descuento_mensual=tasa_mensual)
        
        # Calcular totales
        total_pagado = sum(fila["cuota"] for fila in tabla[1:])
        intereses_pagados = sum(fila["interes"] for fila in tabla[1:])
        
        return {
            "cuota_mensual": round(cuota_final, 2) if periodo_gracia < plazo_total else 0,
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
        
    except Exception as e:
        print(f"Error en simulate_credit: {e}")
        raise