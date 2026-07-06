from abc import ABC, abstractmethod
from pydantic import BaseModel
from typing import Optional, List

class Hallazgo(BaseModel):
    tipo: str
    descripcion: str
    confianza: float

class ClassificationResult(BaseModel):
    tipo: str
    area: str
    arquitectura: str
    prioridad: str
    sentimiento: str
    causa_probable: str
    accion_recomendada: str
    resumen: str
    impacto: str
    riesgo: str
    recomendacion: str
    hallazgos: List[Hallazgo] = []

class BaseLLMAdapter(ABC):
    @abstractmethod
    def classify(self, subject: str, body: str) -> ClassificationResult:
        pass
