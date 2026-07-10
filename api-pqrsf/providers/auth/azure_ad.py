from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from providers.auth.interface import IAuthProvider

class AzureADAuthProvider(IAuthProvider):
    def __init__(self, tenant_id: str, client_id: str):
        self.tenant_id = tenant_id
        self.client_id = client_id

    def authenticate(self, db: Session, credentials: Any) -> Optional[Dict[str, Any]]:
        # This is a stub for Sprint 2-A.
        # In the future, 'credentials' will likely be a token from the frontend (OIDC/OAuth2 flow)
        # For now, it will raise NotImplementedError or return a mock token payload if we want to simulate it.
        raise NotImplementedError("Azure AD integration pending")
