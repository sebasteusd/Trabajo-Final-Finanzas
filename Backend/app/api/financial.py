# app/api/financial.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.financial import FinancialEntity
from ..schemas import FinancialEntityRead 

router = APIRouter()

@router.get("/entities", response_model=List[FinancialEntityRead])
def get_financial_entities(db: Session = Depends(get_db)):
    # Retorna solo las activas, o todas si no tienes columna de estado
    entities = db.query(FinancialEntity).all()
    return entities