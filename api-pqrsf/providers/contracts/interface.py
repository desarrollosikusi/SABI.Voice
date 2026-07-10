from abc import ABC, abstractmethod
from typing import List, Optional
from contract_schemas import ContractResponse, ContractMetrics, IntegrationStatus

class IContractProvider(ABC):
    @abstractmethod
    def get_customer_contracts(self, customer_id: int, filters: Optional[dict] = None) -> List[ContractResponse]:
        """
        [Contrato de Integración S2-B]
        Entradas:
            - customer_id (int): ID local del cliente a consultar.
            - filters (dict): Filtros opcionales (ej. status="Activo").
        Salidas:
            - List[ContractResponse]: Lista de contratos DTO normalizados. Lista vacía si no hay coincidencias.
        Excepciones esperadas:
            - ValueError si el ID de cliente no es válido o no tiene mapeo externo.
            - CircuitBreakerOpenException si Planview falla (5xx o timeout).
        Tiempos máximos (SLA):
            - 2000ms max.
        Comportamiento Degradado:
            - Si el proveedor falla, la UI debe recibir un CircuitBreakerOpenException o una lista parcial cacheadas.
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
