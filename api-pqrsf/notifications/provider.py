from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from models import OperationalEvent, EventReceipt, User, Customer

class BaseEvent(ABC):
    pass

class OperationalEventPayload:
    def __init__(
        self,
        event_type: str,
        origin: str,
        severity: str,
        title: str,
        description: str,
        channel: str = "all", # all, notification, command_center, teams, etc.
        entity_type: Optional[str] = None,
        entity_id: Optional[int] = None,
        customer_id: Optional[int] = None,
        recommended_action: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        recipients: Optional[List[int]] = None # List of user IDs. If None, we broadcast or calculate based on customer.
    ):
        self.event_type = event_type
        self.origin = origin
        self.severity = severity
        self.title = title
        self.description = description
        self.channel = channel
        self.entity_type = entity_type
        self.entity_id = entity_id
        self.customer_id = customer_id
        self.recommended_action = recommended_action
        self.metadata = metadata or {}
        self.recipients = recipients

class IEventPublisher(ABC):
    @abstractmethod
    def publish(self, event: OperationalEventPayload) -> bool:
        pass

class DatabaseEventPublisher(IEventPublisher):
    def __init__(self, db: Session):
        self.db = db

    def publish(self, event: OperationalEventPayload) -> bool:
        try:
            # 1. Create the OperationalEvent
            payload_data = {
                "title": event.title,
                "description": event.description,
                "recommended_action": event.recommended_action,
                **event.metadata
            }
            
            db_event = OperationalEvent(
                event_type=event.event_type,
                origin=event.origin,
                severity=event.severity,
                channel=event.channel,
                entity_type=event.entity_type,
                entity_id=event.entity_id,
                customer_id=event.customer_id,
                payload=payload_data
            )
            self.db.add(db_event)
            self.db.flush() # To get the event ID

            # 2. Determine Recipients
            target_user_ids = event.recipients
            
            if target_user_ids is None:
                # Resolve targets dynamically if not explicitly provided
                target_user_ids = []
                if event.customer_id:
                    # Notify the AM / PM of the customer
                    # We look up users associated with this customer
                    # For MVP, we might notify all admins or the specific AM
                    customer = self.db.query(Customer).filter(Customer.id == event.customer_id).first()
                    if customer and customer.responsable_id:
                        target_user_ids.append(customer.responsable_id)
                
                # Always notify Admins for critical events
                if event.severity in ["Crítico", "Alto"]:
                    admins = self.db.query(User).filter(User.role_id == 1).all() # Assuming 1 is Admin
                    target_user_ids.extend([admin.id for admin in admins])
                    
            # Deduplicate targets
            target_user_ids = list(set(target_user_ids))
            
            # 3. Create EventReceipts
            for uid in target_user_ids:
                receipt = EventReceipt(
                    event_id=db_event.id,
                    user_id=uid
                )
                self.db.add(receipt)
                
            self.db.commit()
            return True
            
        except Exception as e:
            self.db.rollback()
            print(f"Error publishing event: {e}")
            return False

# Factory

def get_event_publisher(db: Session = None) -> IEventPublisher:
    # Si no se pasa DB, esto fallará, pero en FastAPI idealmente se inyecta.
    from database import SessionLocal
    if db is None:
        db = SessionLocal()
    return DatabaseEventPublisher(db)

# --- BACKWARD COMPATIBILITY ---
class LegacyNotificationProvider:
    def send(self, recipient: str, title: str, message: str):
        from database import SessionLocal
        db = SessionLocal()
        try:
            pub = get_event_publisher(db)
            pub.publish(OperationalEventPayload(
                event_type="LEGACY_NOTIFICATION",
                origin="SYSTEM",
                severity="Informativo",
                title=title,
                description=message,
                channel="all"
            ))
        except Exception as e:
            print(f"Error in legacy notification: {e}")
        finally:
            db.close()

def get_notification_provider():
    return LegacyNotificationProvider()
