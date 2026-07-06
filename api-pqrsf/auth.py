import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import models
from database import get_db
from notifications.provider import get_notification_provider

SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_MINUTES", "1440")) # Default 1 day, Configurable

# In-memory Rate Limiter
# Format: { 'ip_address': {'attempts': int, 'reset_time': datetime} }
_login_attempts = {}

def check_rate_limit(request: Request):
    ip = request.client.host
    now = datetime.utcnow()
    
    # Cleanup expired
    if ip in _login_attempts and _login_attempts[ip]['reset_time'] < now:
        del _login_attempts[ip]
        
    if ip in _login_attempts:
        if _login_attempts[ip]['attempts'] >= 5:
            get_notification_provider().send("Seguridad", "CustomerLoginFailed", f"Rate limit excedido para IP {ip}")
            raise HTTPException(status_code=429, detail="Demasiados intentos. Intente nuevamente en 15 minutos.")
        _login_attempts[ip]['attempts'] += 1
    else:
        _login_attempts[ip] = {'attempts': 1, 'reset_time': now + timedelta(minutes=15)}
        
    return True


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_token_payload(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise credentials_exception

def get_current_user(payload: dict = Depends(get_token_payload), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user_type = payload.get("user_type")
    if user_type != "internal":
        raise credentials_exception
    
    username = payload.get("sub")
    if username is None:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user

def get_current_customer(payload: dict = Depends(get_token_payload), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user_type = payload.get("user_type")
    if user_type != "customer":
        raise credentials_exception
        
    contact_id = payload.get("contact_id")
    if contact_id is None:
        raise credentials_exception
        
    contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
    if contact is None or not contact.is_active or not contact.authorized_for_pqrsf:
        raise credentials_exception
    return contact
