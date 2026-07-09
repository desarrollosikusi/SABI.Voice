from typing import List, Optional
from datetime import date, datetime, timedelta
from contract_schemas import ContractResponse, ContractMetrics, IntegrationStatus, ContractTypeEnum, ContractHealthEnum
from providers.contracts.interface import IContractProvider

class MockContractProvider(IContractProvider):
    def __init__(self):
        # Generate realistic IKUSI mock data
        self.mock_data = [
            ContractResponse(
                external_id="PRJ-10023",
                contract_type=ContractTypeEnum.PROYECTO,
                name="Renovación Core Bancario",
                customer_id=0, # Will be replaced dynamically
                status="En Ejecución",
                architecture="Data Center",
                pm="Carlos Ramirez",
                sdm="Laura Gomez",
                start_date=date.today() - timedelta(days=60),
                end_date=date.today() + timedelta(days=120),
                progress=35.5,
                health=ContractHealthEnum.VERDE,
                planned_hours=1200,
                consumed_hours=420,
                contracted_value=250000.0,
                executed_value=85000.0,
                sla="99.9%"
            ),
            ContractResponse(
                external_id="SRV-8832",
                contract_type=ContractTypeEnum.SERVICIO_ADMINISTRADO,
                name="Soporte Enterprise Network",
                customer_id=0,
                status="Activo",
                architecture="Enterprise Network",
                pm="Andres Silva",
                sdm="Maria Perez",
                start_date=date.today() - timedelta(days=200),
                end_date=date.today() + timedelta(days=165),
                progress=55.0,
                health=ContractHealthEnum.AMARILLO,
                planned_hours=3000,
                consumed_hours=1600,
                contracted_value=120000.0,
                executed_value=60000.0,
                sla="99.95%"
            ),
            ContractResponse(
                external_id="PRJ-10045",
                contract_type=ContractTypeEnum.PROYECTO,
                name="Implementación SD-WAN",
                customer_id=0,
                status="En Ejecución",
                architecture="Enterprise Network",
                pm="Carlos Ramirez",
                sdm="Luis Torres",
                start_date=date.today() - timedelta(days=10),
                end_date=date.today() + timedelta(days=90),
                progress=10.0,
                health=ContractHealthEnum.VERDE,
                planned_hours=800,
                consumed_hours=80,
                contracted_value=150000.0,
                executed_value=15000.0,
                sla="99.9%"
            ),
            ContractResponse(
                external_id="SRV-9011",
                contract_type=ContractTypeEnum.SOPORTE,
                name="Cisco SmartNet Mantenimiento",
                customer_id=0,
                status="Activo",
                architecture="Collaboration",
                pm=None,
                sdm="Laura Gomez",
                start_date=date.today() - timedelta(days=300),
                end_date=date.today() + timedelta(days=65),
                progress=82.0,
                health=ContractHealthEnum.ROJO,
                planned_hours=500,
                consumed_hours=450,
                contracted_value=45000.0,
                executed_value=40500.0,
                sla="99.5%"
            )
        ]

    def get_customer_contracts(self, customer_id: int, filters: Optional[dict] = None) -> List[ContractResponse]:
        # Return a copy of mock data with the customer_id assigned
        results = []
        for contract in self.mock_data:
            c = contract.model_copy()
            c.customer_id = customer_id
            results.append(c)
        return results

    def get_contract(self, external_id: str) -> ContractResponse:
        for contract in self.mock_data:
            if contract.external_id == external_id:
                return contract
        raise Exception("Contract not found")

    def get_customer_metrics(self, customer_id: int) -> ContractMetrics:
        # In a real scenario, this would aggregate data for the specific customer
        return ContractMetrics(
            active_projects=2,
            active_services=2,
            ending_soon=1,
            total_consumed_hours=2550,
            total_planned_hours=5500,
            avg_progress=45.6,
            overall_health=ContractHealthEnum.AMARILLO
        )

    def get_integration_status(self) -> IntegrationStatus:
        return IntegrationStatus(
            provider_name="Mock Provider",
            last_sync=None,
            status="Pendiente",
            is_available=True
        )
