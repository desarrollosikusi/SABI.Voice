from abc import ABC, abstractmethod

class NotificationProvider(ABC):
    @abstractmethod
    def send(self, recipient: str, subject: str, message: str) -> bool:
        pass

class ConsoleProvider(NotificationProvider):
    def send(self, recipient: str, subject: str, message: str) -> bool:
        print("\n" + "="*50)
        print(f"📧 [NOTIFICATION ENVIADA]")
        print(f"Para: {recipient}")
        print(f"Asunto: {subject}")
        print(f"Mensaje:\n{message}")
        print("="*50 + "\n")
        return True

# Factory pattern to get the provider
def get_notification_provider() -> NotificationProvider:
    return ConsoleProvider()
