from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Dict, Any
from datetime import datetime
import models, schemas, auth
from database import get_db
from notifications.provider import get_event_publisher, OperationalEventPayload

router = APIRouter()

class EventReceiptResponse(schemas.BaseModel):
    id: int
    read_at: Optional[datetime]
    archived_at: Optional[datetime]
    created_at: datetime
    event_id: int
    event_type: str
    origin: str
    severity: str
    channel: Optional[str]
    entity_type: Optional[str]
    entity_id: Optional[int]
    customer_id: Optional[int]
    payload: Optional[Dict[str, Any]]

    class Config:
        orm_mode = True

class TimelineEventResponse(schemas.BaseModel):
    id: str
    event_type: str
    title: str
    description: str
    date: datetime
    source: str
    severity: str
    entity_type: Optional[str]
    entity_id: Optional[int]
    metadata: Optional[Dict[str, Any]] = None

@router.get("/timeline", response_model=List[TimelineEventResponse])
def get_timeline(
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    customer_id: Optional[int] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    # Query raw OperationalEvents (not receipts, because timeline is global)
    query = db.query(models.OperationalEvent)
    
    if entity_type:
        query = query.filter(models.OperationalEvent.entity_type == entity_type)
    if entity_id:
        query = query.filter(models.OperationalEvent.entity_id == entity_id)
    if customer_id:
        query = query.filter(models.OperationalEvent.customer_id == customer_id)
        
    events = query.order_by(models.OperationalEvent.created_at.desc()).limit(limit).all()
    
    result = []
    for e in events:
        payload = e.payload or {}
        result.append(TimelineEventResponse(
            id=str(e.id),
            event_type=e.event_type,
            title=payload.get("title", f"Evento {e.event_type}"),
            description=payload.get("description", "Sin descripción"),
            date=e.created_at,
            source=e.origin,
            severity=e.severity,
            entity_type=e.entity_type,
            entity_id=e.entity_id,
            metadata=payload
        ))
    return result

@router.get("/", response_model=List[EventReceiptResponse])
def get_my_events(
    status: Optional[str] = None, # "unread", "read", "archived"
    severity: Optional[str] = None,
    limit: int = 50,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.EventReceipt).join(models.OperationalEvent).filter(
        models.EventReceipt.user_id == current_user.id
    )

    if status == "unread":
        query = query.filter(models.EventReceipt.read_at == None, models.EventReceipt.archived_at == None)
    elif status == "read":
        query = query.filter(models.EventReceipt.read_at != None, models.EventReceipt.archived_at == None)
    elif status == "archived":
        query = query.filter(models.EventReceipt.archived_at != None)
    else:
        # Default: not archived
        query = query.filter(models.EventReceipt.archived_at == None)

    if severity:
        query = query.filter(models.OperationalEvent.severity == severity)

    receipts = query.order_by(desc(models.EventReceipt.created_at)).limit(limit).all()

    # Flatten for response
    result = []
    for r in receipts:
        result.append({
            "id": r.id,
            "read_at": r.read_at,
            "archived_at": r.archived_at,
            "created_at": r.created_at,
            "event_id": r.event_id,
            "event_type": r.event.event_type,
            "origin": r.event.origin,
            "severity": r.event.severity,
            "channel": r.event.channel,
            "entity_type": r.event.entity_type,
            "entity_id": r.event.entity_id,
            "customer_id": r.event.customer_id,
            "payload": r.event.payload
        })

    return result

@router.put("/{receipt_id}/read")
def mark_event_read(
    receipt_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    receipt = db.query(models.EventReceipt).filter(
        models.EventReceipt.id == receipt_id,
        models.EventReceipt.user_id == current_user.id
    ).first()

    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")

    if not receipt.read_at:
        receipt.read_at = datetime.utcnow()
        db.commit()

    return {"status": "success"}

@router.put("/{receipt_id}/archive")
def archive_event(
    receipt_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    receipt = db.query(models.EventReceipt).filter(
        models.EventReceipt.id == receipt_id,
        models.EventReceipt.user_id == current_user.id
    ).first()

    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")

    if not receipt.archived_at:
        receipt.archived_at = datetime.utcnow()
        db.commit()

    return {"status": "success"}

# --- DEV ENDPOINT ---
@router.post("/internal/dev/simulate-events")
def simulate_events(
    customer_id: int,
    event_type: str = Query(..., description="SLA_DUE, IA_RISK, NEW_CONTRACT"),
    db: Session = Depends(get_db)
):
    # This endpoint is strictly for development
    publisher = get_event_publisher(db)
    now = datetime.utcnow()
    
    if event_type == "SLA_DUE":
        publisher.publish(OperationalEventPayload(
            event_type="SLA_DUE",
            origin="SYSTEM_CRON",
            severity="Alto",
            title="SLA próximo a vencer",
            description="El SLA de resolución del caso vence en 4 horas.",
            channel="all",
            entity_type="pqrsf",
            entity_id=1, # Mock ID
            customer_id=customer_id,
            recommended_action="Escalar con el técnico responsable."
        ))
    elif event_type == "IA_RISK":
        publisher.publish(OperationalEventPayload(
            event_type="IA_RISK",
            origin="GEMINI_IA",
            severity="Crítico",
            title="Riesgo de Abandono Detectado",
            description="La IA detectó sentimiento negativo continuo en los últimos 3 tickets.",
            channel="all",
            entity_type="customer",
            entity_id=customer_id,
            customer_id=customer_id,
            recommended_action="Agendar QBR extraordinario y ofrecer descuento comercial."
        ))
    elif event_type == "NEW_CONTRACT":
        publisher.publish(OperationalEventPayload(
            event_type="NEW_CONTRACT",
            origin="PLANVIEW",
            severity="Información",
            title="Nuevo Contrato Sincronizado",
            description="Se sincronizó un nuevo contrato desde Planview.",
            channel="all",
            entity_type="contract",
            entity_id=999,
            customer_id=customer_id
        ))
    else:
        raise HTTPException(status_code=400, detail="Unknown event type")

    return {"status": "simulated"}
