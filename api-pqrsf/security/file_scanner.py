from abc import ABC, abstractmethod

class FileScannerProvider(ABC):
    @abstractmethod
    def scan_file(self, file_path: str) -> bool:
        """Scan a file and return True if safe, False if threat detected."""
        pass

class NoOpScanner(FileScannerProvider):
    def scan_file(self, file_path: str) -> bool:
        # In MVP, this scanner blindly trusts files that passed magic bytes validation
        return True

class ClamAVScanner(FileScannerProvider):
    def scan_file(self, file_path: str) -> bool:
        # Placeholder for ClamAV integration
        return True

# Provider registry
_scanner = NoOpScanner()

def get_file_scanner() -> FileScannerProvider:
    return _scanner

def set_file_scanner(scanner: FileScannerProvider):
    global _scanner
    _scanner = scanner
