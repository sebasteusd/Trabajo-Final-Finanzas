from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base # Asegúrate de que Base esté importada desde app.database
from app.models.financial import FinancialEntity
from app.models.property import Property, PropertyPhoto

# ==========================================
# DATOS DE ENTIDADES FINANCIERAS (18 TOTAL)
# ==========================================
# Nota sobre los decimales:
# Tasa: 0.0950 = 9.50% Anual
# Seguros (Mensual): 0.00028 = 0.028% Mensual
# ==========================================

ENTIDADES = [
    # --- BANCOS ---
    {
        "nombre": "BCP",
        "tipo": "banco",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/d/d1/Banco_de_Cr%C3%A9dito_del_Per%C3%BA_logo.svg",
        "tasa_referencial": 0.0990,
        "gastos_administrativos": 10.00,
        "seguro_desgravamen": 0.00066, # ~0.066% mensual
        "seguro_inmueble": 0.00026      # ~0.026% mensual
    },
    {
        "nombre": "BBVA",
        "tipo": "banco",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Logo_BBVA.svg/2560px-Logo_BBVA.svg.png",
        "tasa_referencial": 0.0950,
        "gastos_administrativos": 10.00,
        "seguro_desgravamen": 0.00062,
        "seguro_inmueble": 0.00028
    },
    {
        "nombre": "Interbank",
        "tipo": "banco",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/8/81/Interbank_logo.svg",
        "tasa_referencial": 0.0980,
        "gastos_administrativos": 10.00,
        "seguro_desgravamen": 0.00070,
        "seguro_inmueble": 0.00027
    },
    {
        "nombre": "Scotiabank",
        "tipo": "banco",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Scotiabank_logo.svg/2560px-Scotiabank_logo.svg.png",
        "tasa_referencial": 0.0970,
        "gastos_administrativos": 12.00,
        "seguro_desgravamen": 0.00075,
        "seguro_inmueble": 0.00029
    },
    {
        "nombre": "BanBif",
        "tipo": "banco",
        "logo_url": None,
        "tasa_referencial": 0.1000,
        "gastos_administrativos": 15.00,
        "seguro_desgravamen": 0.00079,
        "seguro_inmueble": 0.00030
    },
    {
        "nombre": "Banco Pichincha",
        "tipo": "banco",
        "logo_url": None,
        "tasa_referencial": 0.1050,
        "gastos_administrativos": 15.00,
        "seguro_desgravamen": 0.00083,
        "seguro_inmueble": 0.00030
    },
    {
        "nombre": "Banco GNB",
        "tipo": "banco",
        "logo_url": None,
        "tasa_referencial": 0.0960,
        "gastos_administrativos": 10.00,
        "seguro_desgravamen": 0.00066,
        "seguro_inmueble": 0.00025
    },
    {
        "nombre": "Mibanco",
        "tipo": "banco",
        "logo_url": None,
        "tasa_referencial": 0.1450,
        "gastos_administrativos": 15.00,
        "seguro_desgravamen": 0.00125,
        "seguro_inmueble": 0.00035
    },
    # --- CAJAS ---
    {
        "nombre": "Caja Arequipa",
        "tipo": "caja",
        "logo_url": None,
        "tasa_referencial": 0.1300,
        "gastos_administrativos": 10.00,
        "seguro_desgravamen": 0.00100,
        "seguro_inmueble": 0.00032
    },
    {
        "nombre": "Caja Huancayo",
        "tipo": "caja",
        "logo_url": None,
        "tasa_referencial": 0.1320,
        "gastos_administrativos": 10.00,
        "seguro_desgravamen": 0.00104,
        "seguro_inmueble": 0.00032
    },
    {
        "nombre": "Caja Piura",
        "tipo": "caja",
        "logo_url": None,
        "tasa_referencial": 0.1350,
        "gastos_administrativos": 10.00,
        "seguro_desgravamen": 0.00108,
        "seguro_inmueble": 0.00032
    },
    {
        "nombre": "Caja Sullana",
        "tipo": "caja",
        "logo_url": None,
        "tasa_referencial": 0.1400,
        "gastos_administrativos": 10.00,
        "seguro_desgravamen": 0.00116,
        "seguro_inmueble": 0.00035
    },
    {
        "nombre": "Caja Trujillo",
        "tipo": "caja",
        "logo_url": None,
        "tasa_referencial": 0.1380,
        "gastos_administrativos": 10.00,
        "seguro_desgravamen": 0.00112,
        "seguro_inmueble": 0.00033
    },
    {
        "nombre": "Caja Cusco",
        "tipo": "caja",
        "logo_url": None,
        "tasa_referencial": 0.1350,
        "gastos_administrativos": 10.00,
        "seguro_desgravamen": 0.00108,
        "seguro_inmueble": 0.00033
    },
    {
        "nombre": "Caja Tacna",
        "tipo": "caja",
        "logo_url": None,
        "tasa_referencial": 0.1420,
        "gastos_administrativos": 10.00,
        "seguro_desgravamen": 0.00116,
        "seguro_inmueble": 0.00035
    },
    {
        "nombre": "Caja Metropolitana",
        "tipo": "caja",
        "logo_url": None,
        "tasa_referencial": 0.1250,
        "gastos_administrativos": 10.00,
        "seguro_desgravamen": 0.00091,
        "seguro_inmueble": 0.00030
    },
    # --- OTRAS ---
    {
        "nombre": "Financiera Efectiva",
        "tipo": "financiera",
        "logo_url": None,
        "tasa_referencial": 0.1600,
        "gastos_administrativos": 20.00,
        "seguro_desgravamen": 0.00150,
        "seguro_inmueble": 0.00040
    },
    {
        "nombre": "Vivela",
        "tipo": "empresa_credito",
        "logo_url": None,
        "tasa_referencial": 0.1550,
        "gastos_administrativos": 20.00,
        "seguro_desgravamen": 0.00141,
        "seguro_inmueble": 0.00040
    }
]

# ==========================================
# DATOS DE PROPIEDADES (Sin Cambios)
# ==========================================
PROPIEDADES = [
    {
        "proyecto": "Residencial El Olivar",
        "tipo_unidad": "Departamento",
        "area_m2": 85.50,
        "precio_venta": 450000.00,
        "direccion": "Av. Conquistadores 550",
        "lugar": "San Isidro",
        "habitaciones": 2,
        "banos": 2,
        "descripcion": "Hermoso departamento con vista al parque El Olivar. Acabados de lujo.",
        "foto": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750"
    },
    {
        "proyecto": "Torre Javier Prado",
        "tipo_unidad": "Departamento",
        "area_m2": 120.00,
        "precio_venta": 780000.00,
        "direccion": "Av. Javier Prado Oeste 2200",
        "lugar": "Magdalena",
        "habitaciones": 3,
        "banos": 3,
        "descripcion": "Departamento familiar amplio, cerca a centros comerciales y colegios.",
        "foto": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
    },
    {
        "proyecto": "Casa de Campo Pachacamac",
        "tipo_unidad": "Casa",
        "area_m2": 250.00,
        "precio_venta": 950000.00,
        "direccion": "Calle Los Suspiros, Fundo Mamacona",
        "lugar": "Pachacamac",
        "habitaciones": 4,
        "banos": 4,
        "descripcion": "Casa de campo ideal para fines de semana. Piscina y zona de parrilla.",
        "foto": "https://cdn.pixabay.com/photo/2017/07/18/03/50/sgt-2514669_1280.jpg"
    }
]

# =============================================================
# FUNCIÓN DE POBIMIENTO (ACTUALIZADA para crear tablas primero)
# =============================================================
def seed_db():
    db = SessionLocal()
    try:
        # --- AÑADIDO: Creación de tablas si no existen ---
        print("🛠️ Verificando y creando tablas...")
        Base.metadata.create_all(bind=engine)
        print("✅ Tablas verificadas/creadas.")
        # ----------------------------------------------------

        # 1. Sembrando Entidades Financieras
        # Verificamos si la tabla está vacía para no duplicar en cada reinicio
        if db.query(FinancialEntity).count() == 0:
            print("🚀 Sembrando Entidades Financieras...")
            for ent in ENTIDADES:
                financiera = FinancialEntity(**ent)
                db.add(financiera)
            db.commit()
            print(f"✅ {len(ENTIDADES)} Entidades financieras agregadas.")
        else:
            print("ℹ️ Las entidades financieras ya existen en la BD (Saltando seed).")

        # 2. Sembrando Propiedades
        if db.query(Property).count() == 0:
            print("🏠 Sembrando Propiedades...")
            for p in PROPIEDADES:
                # Separamos la foto para crearla en la tabla PropertyPhoto
                foto_url = p.pop("foto") 
                
                propiedad = Property(**p)
                db.add(propiedad)
                db.commit() # Commit intermedio para generar el ID de propiedad
                db.refresh(propiedad)
                
                # Agregar foto principal vinculada
                foto = PropertyPhoto(id_unidad=propiedad.id_unidad, url_foto=foto_url, orden=1)
                db.add(foto)
            
            db.commit()
            print(f"✅ {len(PROPIEDADES)} Propiedades agregadas.")
        else:
            print("ℹ️ Las propiedades ya existen en la BD (Saltando seed).")

    except Exception as e:
        print(f"❌ Error en seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("--- Iniciando carga de datos de prueba ---")
    seed_db()
    print("--- Finalizado ---")