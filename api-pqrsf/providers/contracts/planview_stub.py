from typing import List, Optional
from contract_schemas import ContractResponse, ContractMetrics, IntegrationStatus
from providers.contracts.interface import IContractProvider

class PlanviewContractProvider(IContractProvider):
    """
    Stub for future Planview integration.
    Currently raises NotImplementedError for all methods.
    """
    def __init__(self, api_url: str, api_key: str):
        self.api_url = api_url
        self.api_key = api_key

    def get_customer_contracts(self, customer_id: int, filters: Optional[dict] = None) -> List[ContractResponse]:
        raise NotImplementedError("Planview integration pending")
    
    def get_contract(self, external_id: str) -> ContractResponse:
        raise NotImplementedError("Planview integration pending")
        
    def get_customer_metrics(self, customer_id: int) -> ContractMetrics:
        raise NotImplementedError("Planview integration pending")

    def get_integration_status(self) -> IntegrationStatus:
        return IntegrationStatus(
            provider_name="Planview",
            last_sync=None,
            status="Pendiente",
            is_available=False
        )
