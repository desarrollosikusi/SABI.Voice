import pytest
from core.config import settings
from providers.contracts.mock import MockContractProvider
from providers.auth.local import LocalAuthProvider
from providers.email.imap import IMAPEmailProvider

def test_mock_contract_provider():
    provider = MockContractProvider()
    contracts = provider.get_customer_contracts(1)
    assert len(contracts) > 0
    assert contracts[0].customer_id == 1
    
    # Check circuit breaker / cache
    c2 = provider.get_customer_contracts(1)
    assert len(c2) == len(contracts)

def test_local_auth_provider_signature():
    provider = LocalAuthProvider()
    assert hasattr(provider, "authenticate")

def test_imap_provider_signature():
    provider = IMAPEmailProvider("imap.example.com", 993, "user", "pass")
    assert hasattr(provider, "fetch_unread_emails")
    assert provider.fetch_unread_emails() == []
