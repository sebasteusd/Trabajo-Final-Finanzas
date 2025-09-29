def calcular_tasa_mensual(tasa, tipo_tasa, capitalizacion):
    if tipo_tasa == "efectiva":
        return (1 + tasa / 100) ** (1 / 12) - 1
    elif tipo_tasa == "nominal":
        return (tasa / 100) / capitalizacion
    else:
        raise ValueError("Tipo de tasa inválido")

def simulate_credit(data):
    monto = data.monto - data.bono_techo_propio
    tasa_mensual = calcular_tasa_mensual(data.tasa, data.tipo_tasa, data.capitalizacion)
    n = data.plazo_meses

    if data.gracia == "total":
        cuota = 0
        total = monto
        intereses = 0
    elif data.gracia == "parcial":
        cuota = (monto * tasa_mensual)
        total = cuota * n
        intereses = total - monto
    else:
        cuota = (monto * tasa_mensual) / (1 - (1 + tasa_mensual) ** -n)
        total = cuota * n
        intereses = total - monto

    return {
        "cuota_mensual": round(cuota, 2),
        "total_pagado": round(total, 2),
        "intereses_pagados": round(intereses, 2)
    }