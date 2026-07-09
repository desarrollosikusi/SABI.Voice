from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from enum import Enum

class ContractTypeEnum(str, Enum):
    PROYECTO = "Proyecto"
    SERVICIO_ADMINISTRADO = "Servicio Administrado"
    BOLSA_HORAS = "Bolsa de Horas"
    SOPORTE = "Soporte"
    MANTENIMIENTO = "Mantenimiento"
    SUSCRIPCION = "Suscripción"
    RENOVACION = "Renovación"
    OTRO = "Otro"

class ContractHealthEnum(str, Enum):
    VERDE = "Verde"
    AMARILLO = "Amarillo"
    ROJO = "Rojo"
    NO_DISPONIBLE = "No disponible"

class ContractResponse(BaseModel):
    external_id: str
    contract_type: str
    name: str
    customer_id: int
    status: str
    architecture: str
    pm: Optional[str] = None
    sdm: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    progress: float = 0.0
    health: str = ContractHealthEnum.NO_DISPONIBLE
    planned_hours: Optional[int] = None
    consumed_hours: Optional[int] = None
    contracted_value: Optional[float] = None
    executed_value: Optional[float] = None
    sla: Optional[str] = None

class ContractMetrics(BaseModel):
    active_projects: int = 0
    active_services: int = 0
    ending_soon: int = 0
    total_consumed_hours: int = 0
    total_planned_hours: int = 0
    avg_progress: float = 0.0
    overall_health: str = ContractHealthEnum.NO_DISPONIBLE

class IntegrationStatus(BaseModel):
    provider_name: str
    last_sync: Optional[datetime] = None
    status: str
    is_available: bool
