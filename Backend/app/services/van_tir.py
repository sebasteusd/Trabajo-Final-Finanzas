import numpy_financial as npf
import math

def construir_flujo_cliente(monto: float, bono: float, tabla: list) -> list:
    """
    Construye el flujo de caja desde la perspectiva del cliente
    Versión simplificada - solo necesita la tabla completa
    """
    flujo = [monto]  # Mes 0: el cliente RECIBE el dinero
    
    for fila in tabla[1:]:  # Saltar el mes 0 que ya procesamos
        flujo.append(fila["flujo"])
    
    return flujo

def calcular_van_tir(flujo: list, tasa_descuento_mensual: float) -> tuple:
    """
    Calcula VAN y TIR del flujo de caja
    """
    try:
        # Calcular VAN
        van = npf.npv(tasa_descuento_mensual, flujo)
        
        # Calcular TIR
        tir_mensual = npf.irr(flujo)
        
        van = round(van, 2) if not math.isnan(van) else None
        
        tir_anual = None
        if tir_mensual is not None and not math.isnan(tir_mensual):
            tir_anual = (1 + tir_mensual) ** 12 - 1
            tir_anual = round(tir_anual * 100, 2)
        
        return van, tir_anual
        
    except Exception as e:
        print(f"Error calculando VAN/TIR: {e}")
        return None, None