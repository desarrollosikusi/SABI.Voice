from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
import auth
import models
from contract_schemas import ContractResponse, ContractMetrics, IntegrationStatus
from providers.contracts.mock import MockContractProvider

router = APIRouter()

from providers.dependencies import get_contract_provider
from providers.contracts.interface import IContractProvider

@router.get("/customers/{customer_id}/contracts", response_model=List[ContractResponse])
def get_customer_contracts(
    customer_id: int, 
    status: Optional[str] = None,
    contract_type: Optional[str] = None,
    architecture: Optional[str] = None,
    provider: IContractProvider = Depends(get_contract_provider),
    current_user: models.User = Depends(auth.get_current_user)
):
    filters = {
        "status": status,
        "contract_type": contract_type,
        "architecture": architecture
    }
    return provider.get_customer_contracts(customer_id, filters)

@router.get("/customers/{customer_id}/contracts/metrics", response_model=ContractMetrics)
def get_customer_contract_metrics(
    customer_id: int,
    provider: IContractProvider = Depends(get_contract_provider),
    current_user: models.User = Depends(auth.get_current_user)
):
    return provider.get_customer_metrics(customer_id)

@router.get("/contracts/integration-status", response_model=IntegrationStatus)
def get_integration_status(
    provider: IContractProvider = Depends(get_contract_provider),
    current_user: models.User = Depends(auth.get_current_user)
):
    return provider.get_integration_status()

@router.get("/contracts/{external_id}", response_model=ContractResponse)
def get_contract_details(
    external_id: str,
    provider: IContractProvider = Depends(get_contract_provider),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        return provider.get_contract(external_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
