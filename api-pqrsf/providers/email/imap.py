from typing import List, Dict, Any
from providers.email.interface import IEmailProvider
from providers.telemetry import observe_provider

class IMAPEmailProvider(IEmailProvider):
    """
    Legacy IMAP implementation stub for retrieving emails.
    """
    def __init__(self, server: str, port: int, user: str, password: str):
        self.server = server
        self.port = port
        self.user = user
        self.password = password

    @observe_provider("IMAP Server")
    def fetch_unread_emails(self) -> List[Dict[str, Any]]:
        # Stub for IMAP fetch logic
        return []

    def mark_as_read(self, email_id: str) -> bool:
        # Stub
        return True

    def send_email(self, to: str, subject: str, html_body: str) -> bool:
        # SMTP outbound stub
        return True
