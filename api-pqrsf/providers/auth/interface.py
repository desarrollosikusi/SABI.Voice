from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

class IAuthProvider(ABC):
    @abstractmethod
    def authenticate(self, db: Session, credentials: Any) -> Optional[Dict[str, Any]]:
        """
        [Contrato de Integración S2-B]
        Entradas: 
            - db (Session): Conexión a la DB local.
            - credentials (Any): Formulario OAuth2, Token JWT OIDC, o cualquier payload de validación.
        Salidas:
            - Dict[str, Any] conteniendo: sub (username), user_type, user_id, roles (List), area.
            - None si las credenciales son inválidas pero no se debe bloquear.
        Excepciones esperadas:
            - HTTPException(400/401/403) ante bloqueo explícito, inactividad o token expirado.
            - CircuitBreakerOpenException si el identity provider externo no responde.
        Tiempos máximos (SLA):
            - 1500ms max.
        Comportamiento Degradado:
            - Si falla (timeout > 1500ms), arrojar 503 Service Unavailable y reintentar. En modo HYBRID, delegar al proveedor local.
        """
        pass
