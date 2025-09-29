from fastapi import APIRouter
from app.models.credit import CreditInput, CreditOutput
from app.services.simulator import simulate_credit

router = APIRouter()

@router.post("/simulate", response_model=CreditOutput)
def simulate(data: CreditInput):
    return simulate_credit(data)