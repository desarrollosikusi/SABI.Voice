import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Base configuration
    APP_NAME: str = "SABI Voice API"
    
    # Auth configuration
    # Options: LOCAL, AAD, HYBRID
    AUTH_MODE: str = os.getenv("AUTH_MODE", "LOCAL")
    ENABLE_LOCAL_LOGIN: bool = os.getenv("ENABLE_LOCAL_LOGIN", "true").lower() == "true"
    
    # Email configuration
    # Options: IMAP, GRAPH
    EMAIL_PROVIDER: str = os.getenv("EMAIL_PROVIDER", "IMAP")

    # Contracts configuration
    # Options: MOCK, PLANVIEW
    CONTRACT_PROVIDER: str = os.getenv("CONTRACT_PROVIDER", "MOCK")
    
    # External integrations details (will be loaded from env)
    AZURE_TENANT_ID: str = os.getenv("AZURE_TENANT_ID", "")
    AZURE_CLIENT_ID: str = os.getenv("AZURE_CLIENT_ID", "")
    AZURE_CLIENT_SECRET: str = os.getenv("AZURE_CLIENT_SECRET", "")
    
    PLANVIEW_API_URL: str = os.getenv("PLANVIEW_API_URL", "https://api.planview.example.com")
    PLANVIEW_API_KEY: str = os.getenv("PLANVIEW_API_KEY", "")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
