# backend/app/services/eligibility.py

# Ingreso Familiar Mensual MÁXIMO (Oficial para Adquisición de Vivienda Nueva - AVN, 2024 aprox)
MAX_INGRESOS_AVN = 3715.0 

def check_techo_propio_eligibility(user_data, client_data) -> dict:
    """
    Verifica la elegibilidad estricta para el Bono Techo Propio (Modalidad AVN) 
    basada en los requisitos del Fondo Mivivienda.
    
    client_data debe incluir: ingresos_mensuales, estado_civil, no_propiedad_previa, no_bono_previo.
    """
    
    # --- 1. Verificación de Ingresos (Límite BFH) ---
    ingresos = float(client_data.ingresos_mensuales or 0)
    if ingresos > MAX_INGRESOS_AVN:
        return {
            "is_eligible": False, 
            "reason": f"Ingreso Familiar Mensual (S/ {ingresos:,.2f}) excede el límite oficial para AVN (S/ {MAX_INGRESOS_AVN:,.2f})."
        }
        
    # --- 2. Verificación de Grupo Familiar (GF) ---
    # En la práctica, Soltero debe tener dependientes. Si no hay dependientes, se rechaza.
    estado_civil = (client_data.estado_civil or "soltero").lower()
    
    if estado_civil not in ["casado", "conviviente"]:
        # Si es soltero, se requiere al menos 1 hijo declarado para simular un GF.
        if estado_civil == "soltero" and client_data.numero_hijos < 1:
            return {"is_eligible": False, "reason": "Si es soltero, debe declarar dependientes (hijos) para conformar el Grupo Familiar."}


    # --- 3. Declaración Jurada: No Propiedad (Usa el campo booleano) ---
    if not client_data.no_propiedad_previa:
        return {
            "is_eligible": False, 
            "reason": "DEBE declarar (marcar casilla) no ser propietario de otra vivienda o terreno a nivel nacional (Requisito BFH)."
        }
        
    # --- 4. Declaración Jurada: No Bono Previo (Usa el campo booleano) ---
    if not client_data.no_bono_previo:
        return {
            "is_eligible": False, 
            "reason": "DEBE declarar (marcar casilla) no haber recibido apoyo habitacional previo del Estado (Requisito BFH)."
        }

    # Si pasa todas las validaciones estrictas
    return {
        "is_eligible": True, 
        "reason": "APTO. El Grupo Familiar cumple con los requisitos legales del Bono Techo Propio (AVN)."
    }