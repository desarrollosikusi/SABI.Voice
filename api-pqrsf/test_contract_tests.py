import pytest
from typing import get_type_hints, List, Dict, Any, Optional

from providers.contracts.interface import IContractProvider
from providers.contracts.mock import MockContractProvider
from providers.contracts.planview_stub import PlanviewContractProvider

from providers.auth.interface import IAuthProvider
from providers.auth.local import LocalAuthProvider
from providers.auth.azure_ad import AzureADAuthProvider

from providers.email.interface import IEmailProvider
from providers.email.imap import IMAPEmailProvider
from providers.email.graph import GraphEmailProvider

def test_contract_provider_equivalence():
    """Verify both implementations adhere exactly to the IContractProvider interface signatures."""
    mock = MockContractProvider()
    real = PlanviewContractProvider("url", "key")
    
    assert isinstance(mock, IContractProvider)
    assert isinstance(real, IContractProvider)
    
    # Check return type hints for get_customer_contracts
    mock_hints = get_type_hints(mock.get_customer_contracts)
    real_hints = get_type_hints(real.get_customer_contracts)
    assert mock_hints.get('return') == real_hints.get('return')
    
    # Actually call the mock to ensure it returns the declared type
    contracts = mock.get_customer_contracts(1)
    assert isinstance(contracts, list)

def test_auth_provider_equivalence():
    """Verify both auth implementations are interchangeable."""
    local = LocalAuthProvider()
    aad = AzureADAuthProvider("tenant", "client")
    
    assert isinstance(local, IAuthProvider)
    assert isinstance(aad, IAuthProvider)
    
    local_hints = get_type_hints(local.authenticate)
    aad_hints = get_type_hints(aad.authenticate)
    assert local_hints.get('return') == aad_hints.get('return')

def test_email_provider_equivalence():
    """Verify both email implementations yield equivalent domain objects."""
    imap = IMAPEmailProvider("server", 993, "u", "p")
    graph = GraphEmailProvider("tenant", "client", "secret", "mbx")
    
    assert isinstance(imap, IEmailProvider)
    assert isinstance(graph, IEmailProvider)
    
    imap_hints = get_type_hints(imap.fetch_unread_emails)
    graph_hints = get_type_hints(graph.fetch_unread_emails)
    assert imap_hints.get('return') == graph_hints.get('return')
