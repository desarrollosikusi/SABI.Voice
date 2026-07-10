from fastapi import Depends
from core.config import settings

# Contracts
from providers.contracts.interface import IContractProvider
from providers.contracts.mock import MockContractProvider
from providers.contracts.planview_stub import PlanviewContractProvider

# Singletons (instantiated once)
mock_contract_provider = MockContractProvider()
planview_contract_provider = PlanviewContractProvider(api_url=settings.PLANVIEW_API_URL, api_key=settings.PLANVIEW_API_KEY)

from providers.auth.interface import IAuthProvider
from providers.auth.local import LocalAuthProvider
from providers.auth.azure_ad import AzureADAuthProvider

local_auth_provider = LocalAuthProvider()
azure_ad_auth_provider = AzureADAuthProvider(
    tenant_id=settings.AZURE_TENANT_ID,
    client_id=settings.AZURE_CLIENT_ID
)

def get_auth_provider() -> IAuthProvider:
    if settings.AUTH_MODE.upper() == "AAD":
        return azure_ad_auth_provider
    elif settings.AUTH_MODE.upper() == "HYBRID":
        # Can return a composite provider or local fallback. We'll default to Local for now in Hybrid
        return local_auth_provider
    
    # Default is LOCAL
    if not settings.ENABLE_LOCAL_LOGIN:
        raise Exception("Local login is disabled but AUTH_MODE is LOCAL")
    return local_auth_provider

def get_contract_provider() -> IContractProvider:
    if settings.CONTRACT_PROVIDER.upper() == "PLANVIEW":
        return planview_contract_provider
    return mock_contract_provider

from providers.email.interface import IEmailProvider
from providers.email.imap import IMAPEmailProvider
from providers.email.graph import GraphEmailProvider

imap_email_provider = IMAPEmailProvider(
    server="imap.example.com",
    port=993,
    user="servicio@example.com",
    password="password"
)

graph_email_provider = GraphEmailProvider(
    tenant_id=settings.AZURE_TENANT_ID,
    client_id=settings.AZURE_CLIENT_ID,
    client_secret=settings.AZURE_CLIENT_SECRET,
    mailbox="servicio@example.com"
)

def get_email_provider() -> IEmailProvider:
    if settings.EMAIL_PROVIDER.upper() == "GRAPH":
        return graph_email_provider
    return imap_email_provider

