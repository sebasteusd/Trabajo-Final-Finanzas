import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from urllib.parse import quote_plus

# =================================================================
#  CONFIGURACIÓN HÍBRIDA (LOCAL vs NUBE)
# =================================================================

# 1. Intentamos leer la URL de la base de datos de las Variables de Entorno (Render)
RENDER_DB_URL = os.getenv("DATABASE_URL")

if RENDER_DB_URL:
    # -------------------------------------------------------------
    # MODO PRODUCCIÓN (RENDER - POSTGRESQL)
    # -------------------------------------------------------------
    # Parche: Render devuelve "postgres://" pero SQLAlchemy necesita "postgresql://"
    if RENDER_DB_URL.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = RENDER_DB_URL.replace("postgres://", "postgresql://", 1)
    else:
        SQLALCHEMY_DATABASE_URL = RENDER_DB_URL

    print("🚀 Modo Nube detectado: Conectando a PostgreSQL en Render")

else:
    # -------------------------------------------------------------
    # MODO DESARROLLO (LOCAL - SQL SERVER)
    # -------------------------------------------------------------
    SERVER = "DESKTOP-AOQKD98"
    DATABASE = "CrediFacilDB"
    USERNAME = "sebasteusdDB"  
    PASSWORD = "123" 

    # Tu configuración original intacta
    SQLALCHEMY_DATABASE_URL = "mssql+pyodbc://{}:{}@{}/{}?driver={}".format(
        USERNAME,
        quote_plus(PASSWORD), 
        SERVER,
        DATABASE,
        'ODBC Driver 17 for SQL Server'
    )
    
    print("💻 Modo Local detectado: Conectando a SQL Server")


# 2. Crear el motor de la base de datos
# PostgreSQL y SQL Server usan argumentos ligeramente diferentes, pero para lo básico
# create_engine funciona igual para ambos con la URL correcta.
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 3. (SessionLocal)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. (Base)
Base = declarative_base()

# Dependencia de la DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()