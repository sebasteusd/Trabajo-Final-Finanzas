from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from urllib.parse import quote_plus

# =================================================================
#  CONFIGURACIÓN PARA AUTENTICACIÓN DE SQL SERVER  
# =================================================================

SERVER = "DESKTOP-AOQKD98"
DATABASE = "CrediFacilDB"
USERNAME = "sebasteusdDB"  
PASSWORD = "123" 

SQLALCHEMY_DATABASE_URL = "mssql+pyodbc://{}:{}@{}/{}?driver={}".format(
    USERNAME,
    quote_plus(PASSWORD), 
    SERVER,
    DATABASE,
    'ODBC Driver 17 for SQL Server'
)

# 1. Crear el motor de la base de datos
engine = create_engine(
    SQLALCHEMY_DATABASE_URL
)

# 2. (SessionLocal)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. (Base)
Base = declarative_base()


# Dependencia de la DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()