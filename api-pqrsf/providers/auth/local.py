from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from fastapi.security import OAuth2PasswordRequestForm
import models
import auth
from notifications.provider import get_notification_provider
from providers.auth.interface import IAuthProvider
from providers.telemetry import observe_provider

class LocalAuthProvider(IAuthProvider):
    @observe_provider("Local DB Auth")
    def authenticate(self, db: Session, credentials: OAuth2PasswordRequestForm) -> Optional[Dict[str, Any]]:
        provider = get_notification_provider()
        user = db.query(models.User).filter(models.User.username == credentials.username).first()
        
        if user and auth.verify_password(credentials.password, user.password_hash):
            if not user.is_active:
                provider.send("Seguridad", "LoginFailed", f"Usuario inactivo intentó acceder: {credentials.username}")
                raise HTTPException(status_code=400, detail="Inactive user")
            
            provider.send("Seguridad", "InternalLogin", f"Usuario interno {user.username} inició sesión vía LocalAuthProvider")
            return {
                "sub": user.username,
                "user_type": "internal",
                "user_id": user.id,
                "roles": [user.role],
                "area": user.area.name if user.area else None,
                "token_version": user.token_version
            }
        
        # Will return None if auth fails, the router should throw 401
        return None
