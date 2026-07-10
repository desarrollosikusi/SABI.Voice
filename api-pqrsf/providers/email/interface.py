from abc import ABC, abstractmethod
from typing import List, Dict, Any

class IEmailProvider(ABC):
    @abstractmethod
    def fetch_unread_emails(self) -> List[Dict[str, Any]]:
        """
        [Contrato de Integración S2-B]
        Entradas: Ninguna (los parámetros de conexión provienen del constructor).
        Salidas:
            - List[Dict[str, Any]]: Lista de correos normalizados con 'subject', 'body', 'sender', 'message_id'.
        Excepciones esperadas:
            - ConnectionError si no hay acceso al servidor IMAP/Graph.
            - CircuitBreakerOpenException si el servicio Graph está bajo throttling o rate limit.
        Tiempos máximos (SLA):
            - 5000ms max.
        Comportamiento Degradado:
            - Devolver lista vacía `[]` si ocurre un timeout y registrar el error para reintentar en el próximo polling.
        """
        pass
    
    @abstractmethod
    def mark_as_read(self, email_id: str) -> bool:
        """
        Marks a specific email as read in the mailbox so it is not processed twice.
        """
        pass
    
    @abstractmethod
    def send_email(self, to: str, subject: str, html_body: str) -> bool:
        """
        Sends an outbound email.
        """
        pass
