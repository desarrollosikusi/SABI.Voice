import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class IntegrationProvider(ABC):
    @abstractmethod
    def send(self, recipient: str, message: str, metadata: Optional[Dict[str, Any]] = None) -> bool:
        pass

class MockEmailProvider(IntegrationProvider):
    def send(self, recipient: str, message: str, metadata: Optional[Dict[str, Any]] = None) -> bool:
        logger.info(f"[MOCK EMAIL] Sending to {recipient}: {message}")
        if metadata:
            logger.info(f"[MOCK EMAIL] Metadata: {metadata}")
        return True

class MockTeamsProvider(IntegrationProvider):
    def send(self, recipient: str, message: str, metadata: Optional[Dict[str, Any]] = None) -> bool:
        logger.info(f"[MOCK TEAMS] Sending to channel {recipient}: {message}")
        return True

class MockSharePointProvider(IntegrationProvider):
    def send(self, recipient: str, message: str, metadata: Optional[Dict[str, Any]] = None) -> bool:
        logger.info(f"[MOCK SHAREPOINT] Saving to {recipient}: {message}")
        return True

class MockWhatsAppProvider(IntegrationProvider):
    def send(self, recipient: str, message: str, metadata: Optional[Dict[str, Any]] = None) -> bool:
        logger.info(f"[MOCK WHATSAPP] Sending to {recipient}: {message}")
        return True

class MockActiveDirectoryProvider:
    # AD doesn't just 'send', but might retrieve users. We can mock it here too.
    def get_user_info(self, username: str) -> Optional[Dict[str, Any]]:
        logger.info(f"[MOCK AD] Fetching info for {username}")
        return {"username": username, "name": f"User {username}", "email": f"{username}@ikusi.com"}

# Factory to get providers
def get_provider(provider_type: str) -> Optional[IntegrationProvider]:
    providers = {
        "email": MockEmailProvider(),
        "teams": MockTeamsProvider(),
        "sharepoint": MockSharePointProvider(),
        "whatsapp": MockWhatsAppProvider(),
    }
    return providers.get(provider_type.lower())
