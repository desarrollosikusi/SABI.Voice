from abc import ABC, abstractmethod
from typing import List, Optional
from contract_schemas import ContractResponse, ContractMetrics, IntegrationStatus

class IContractProvider(ABC):
    @abstractmethod
    def get_customer_contracts(self, customer_id: int, filters: Optional[dict] = None) -> List[ContractResponse]:
        """
        Retrieves all contracts associated with a customer from the external system.
        """
        pass
    
    @abstractmethod
    def get_contract(self, external_id: str) -> ContractResponse:
        """
        Retrieves a specific contract by its external ID.
        """
        pass
        
    @abstractmethod
    def get_customer_metrics(self, customer_id: int) -> ContractMetrics:
        """
        Computes or retrieves executive metrics for the customer's contracts.
        """
        pass

    @abstractmethod
    def get_integration_status(self) -> IntegrationStatus:
        """
        Validates the availability of the external system and returns its status.
        """
        pass
