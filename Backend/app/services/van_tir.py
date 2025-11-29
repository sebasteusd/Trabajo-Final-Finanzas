import math

# --- A. CÁLCULO DE TASA MENSUAL (TEM) ---
def calcular_tasa_mensual(tasa, tipo_tasa, capitalizacion):
    if tipo_tasa == "efectiva":
        tasa_efectiva_anual = tasa / 100
        return (1 + tasa_efectiva_anual) ** (1 / 12) - 1
        
    elif tipo_tasa == "nominal":
        if capitalizacion is None:
            raise ValueError("Para tasa nominal se requiere capitalización")
        
        tasa_nominal_anual = tasa / 100
        
        # Diccionario simple para periodos
        mapa_periodos = {
            "diaria": 360, "quincenal": 24, "mensual": 12,
            "bimestral": 6, "trimestral": 4, "cuatrimestral": 3,
            "semestral": 2, "anual": 1
        }
        
        if capitalizacion not in mapa_periodos:
             raise ValueError(f"Capitalización no soportada: {capitalizacion}")
             
        periodos_por_año = mapa_periodos[capitalizacion]
        tasa_periodo = tasa_nominal_anual / periodos_por_año
        
        if capitalizacion == "mensual":
            return tasa_periodo
        
        tasa_efectiva_anual = (1 + tasa_periodo) ** periodos_por_año - 1
        return (1 + tasa_efectiva_anual) ** (1/12) - 1
            
    else:
        raise ValueError("Tipo de tasa inválido. Use 'efectiva' o 'nominal'")

# --- B. CÁLCULO DEL VAN (Valor Actual Neto) ---
def calcular_van_interno(flujos, tasa_descuento=0.0):
    """
    Calcula el VAN. Si tasa_descuento es 0, es la suma simple de flujos.
    """
    van = 0.0
    for i, flujo in enumerate(flujos):
        # Evitar división por cero si la tasa es -1 (improbable en créditos)
        divisor = (1 + tasa_descuento) ** i
        van += flujo / divisor
    return van

# --- C. CÁLCULO DE LA TIR (Tasa Interna de Retorno) ---
def calcular_tir_interno(flujos, guess=0.01):
    """
    Calcula la TIR usando Newton-Raphson con reintentos inteligentes.
    """
    def newton_raphson(guess_inicial):
        tasa = guess_inicial
        tolerance = 1e-6
        max_iterations = 100
        
        for _ in range(max_iterations):
            van = 0.0
            derivada_van = 0.0
            
            for i, flujo in enumerate(flujos):
                base = (1 + tasa)
                if base == 0: return None # Evitar error matemático
                
                vp = flujo / (base ** i)
                van += vp
                
                if i > 0:
                    derivada_van -= i * vp / base
            
            if abs(derivada_van) < 1e-10:
                return None
                
            nueva_tasa = tasa - (van / derivada_van)
            
            # Si la tasa se dispara a -100% o menos, reiniciamos suavemente
            if nueva_tasa <= -1.0:
                nueva_tasa = -0.99

            if abs(nueva_tasa - tasa) < tolerance:
                return nueva_tasa
                
            tasa = nueva_tasa
        return None

    # 1. Primer intento: con el "guess" sugerido (generalmente la tasa del préstamo)
    resultado = newton_raphson(guess)
    if resultado is not None:
        return resultado
        
    # 2. Segundo intento: si falló, intentar con 10%
    resultado = newton_raphson(0.10)
    if resultado is not None:
        return resultado

    # 3. Tercer intento: intentar con tasa pequeña negativa (a veces pasa en flujos raros)
    resultado = newton_raphson(-0.05)
    
    return resultado