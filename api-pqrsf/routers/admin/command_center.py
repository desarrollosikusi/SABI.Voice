from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import models, schemas, auth
from database import get_db

router = APIRouter()

# DTOs Globales
class GlobalSummaryResponse(schemas.BaseModel):
    open_cases: int
    critical_cases: int
    sla_compliance_pct: float
    sla_at_risk: int
    customers_at_risk: int
    critical_events: int

class MyWorkItem(schemas.BaseModel):
    id: int
    consecutivo: str
    asunto: str
    prioridad: str
    estado: str
    fecha_limite: Optional[datetime] = None
    is_sla_at_risk: bool = False

# DTOs
class AlertResponse(schemas.BaseModel):
    id: str
    title: str
    description: str
    severity: str # 'Crítico', 'Alto', 'Medio', 'Informativo'
    source: str
    suggested_action: str
    date: datetime

class ActionItemResponse(schemas.BaseModel):
    id: str
    title: str
    responsible: str
    target_date: Optional[datetime]
    priority: str
    status: str
    source: str
    suggested_action: str = ""

class AiSummaryResponse(schemas.BaseModel):
    general_status: str
    detected_risks: List[str]
    opportunities: List[str]
    next_best_action: str

# Endpoints Globales
@router.get("/global/summary", response_model=GlobalSummaryResponse)
def get_global_summary(db: Session = Depends(get_db)):
    # Calculate mock/real global summary
    open_cases = db.query(models.Pqrsf).join(models.WorkflowState).filter(models.WorkflowState.is_final == False).count()
    
    # Just an approximation for critical cases
    critical_cases = db.query(models.Pqrsf).join(models.WorkflowState).join(models.Priority).filter(
        models.WorkflowState.is_final == False,
        models.Priority.name.ilike("%alta%") # or critica
    ).count()

    sla_at_risk = critical_cases # simple proxy
    
    customers_at_risk = db.query(models.Customer).filter(models.Customer.relationship_score < 70).count()
    
    critical_events = db.query(models.OperationalEvent).filter(
        models.OperationalEvent.severity == "Crítico",
        models.OperationalEvent.status != "archived"
    ).count()

    return GlobalSummaryResponse(
        open_cases=open_cases,
        critical_cases=critical_cases,
        sla_compliance_pct=92.5,
        sla_at_risk=sla_at_risk,
        customers_at_risk=customers_at_risk,
        critical_events=critical_events
    )

@router.get("/global/my-work", response_model=List[MyWorkItem])
def get_my_work(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    # Casos asignados al usuario activo
    casos = db.query(models.Pqrsf).join(models.EstadoPqrsf).filter(
        models.Pqrsf.responsable_id == current_user.id,
        models.EstadoPqrsf.is_final == False
    ).order_by(models.Pqrsf.fecha_creacion.desc()).limit(10).all()
    
    result = []
    for c in casos:
        result.append(MyWorkItem(
            id=c.id,
            consecutivo=c.consecutivo,
            asunto=c.asunto,
            prioridad=c.prioridad.nombre if c.prioridad else "Normal",
            estado=c.estado.nombre if c.estado else "Abierto",
            fecha_limite=None,
            is_sla_at_risk=False
        ))
    return result

@router.get("/global/alerts", response_model=List[AlertResponse])
def get_global_alerts(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    # Eventos operativos dirigidos al usuario actual
    receipts = db.query(models.EventReceipt).join(models.OperationalEvent).filter(
        models.EventReceipt.user_id == current_user.id,
        models.EventReceipt.read_at == None,
        models.EventReceipt.archived_at == None
    ).order_by(models.OperationalEvent.created_at.desc()).limit(10).all()

    alerts = []
    for r in receipts:
        event = r.event
        payload = event.payload or {}
        alerts.append(AlertResponse(
            id=str(event.id),
            title=payload.get("title", f"Evento {event.event_type}"),
            description=payload.get("description", "Sin descripción"),
            severity=event.severity,
            source=event.origin,
            suggested_action=payload.get("recommended_action", ""),
            date=event.created_at
        ))
    
    severity_order = {"Crítico": 1, "Alto": 2, "Medio": 3, "Informativo": 4}
    alerts.sort(key=lambda a: (severity_order.get(a.severity, 5), a.date))
    return alerts

@router.get("/global/actions", response_model=List[ActionItemResponse])
def get_global_actions(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    # Mocking actions for now based on rules and workflow.
    # We could query operational events of type SUGGESTED_ACTION
    return [
        ActionItemResponse(
            id="global_act_1",
            title="Revisar tickets estancados",
            responsible="Tú",
            target_date=datetime.utcnow() + timedelta(hours=4),
            priority="Alta",
            status="Pendiente",
            source="Motor de Reglas",
            suggested_action="Ver Casos > 24h"
        )
    ]



class AiSummaryResponse(schemas.BaseModel):
    general_status: str
    detected_risks: List[str]
    opportunities: List[str]
    next_best_action: str

class TimelineEventResponse(schemas.BaseModel):
    id: str
    event_type: str
    title: str
    description: str
    date: datetime
    source: str
    metadata: Optional[Dict[str, Any]] = None

@router.get("/{customer_id}/alerts", response_model=List[AlertResponse])
def get_alerts(customer_id: int, db: Session = Depends(get_db)):
    # Verify customer
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Fetch Operational Events for this customer
    events = db.query(models.OperationalEvent).filter(
        models.OperationalEvent.customer_id == customer_id,
        models.OperationalEvent.channel.in_(["all", "command_center"]),
        models.OperationalEvent.status != "archived"
    ).all()

    alerts = []
    for event in events:
        payload = event.payload or {}
        alerts.append(AlertResponse(
            id=str(event.id),
            title=payload.get("title", f"Evento {event.event_type}"),
            description=payload.get("description", "Sin descripción"),
            severity=event.severity,
            source=event.origin,
            suggested_action=payload.get("recommended_action", "Revisar el caso."),
            date=event.created_at
        ))

    # Sort by criticality (Crítico > Alto > Medio > Informativo)
    severity_order = {"Crítico": 1, "Alto": 2, "Medio": 3, "Informativo": 4}
    alerts.sort(key=lambda a: (severity_order.get(a.severity, 5), a.date))

    return alerts

@router.get("/{customer_id}/actions", response_model=List[ActionItemResponse])
def get_actions(customer_id: int, db: Session = Depends(get_db)):
    # Mock data for upcoming actions
    now = datetime.utcnow()
    actions = [
        ActionItemResponse(
            id="act_1",
            title="Reunión de Avance Técnico (QBR)",
            responsible="Juan Pérez (SDM)",
            target_date=now + timedelta(days=2),
            priority="Alta",
            status="Pendiente",
            source="Calendario"
        ),
        ActionItemResponse(
            id="act_2",
            title="Cerrar ticket #REQ-2024-001 (Validación con cliente)",
            responsible="Tú",
            target_date=now + timedelta(days=1),
            priority="Media",
            status="En progreso",
            source="PQRSF"
        ),
        ActionItemResponse(
            id="act_3",
            title="Enviar propuesta de renovación de licencias Cisco",
            responsible="María Gómez (AM)",
            target_date=now + timedelta(days=5),
            priority="Alta",
            status="Pendiente",
            source="CRM"
        )
    ]
    return actions

@router.get("/{customer_id}/ai-summary", response_model=AiSummaryResponse)
def get_ai_summary(customer_id: int, db: Session = Depends(get_db)):
    # Calculate real stats to feed the mock AI
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    pqrsfs = db.query(models.Pqrsf).filter(models.Pqrsf.cliente_id == customer_id).all()
    open_count = sum(1 for p in pqrsfs if p.estado and not p.estado.is_final)
    
    score = customer.relationship_score or 0
    health = "estable" if score > 70 else "en deterioro"

    return AiSummaryResponse(
        general_status=f"El cliente {customer.name} presenta un nivel de relación {health} ({score}%). Actualmente mantienen {open_count} casos abiertos.",
        detected_risks=[
            "Retraso en la adopción del nuevo servicio de SD-WAN.",
            "Alta rotación en su equipo técnico (3 cambios de stakeholders en 6 meses)."
        ],
        opportunities=[
            "Interés previo en servicios de Ciberseguridad durante la última reunión.",
            "Renovación de soporte de infraestructura en 3 meses."
        ],
        next_best_action="Proponer un workshop técnico gratuito para mostrar casos de éxito en Ciberseguridad antes de la fecha de renovación."
    )

@router.get("/{customer_id}/timeline", response_model=List[TimelineEventResponse])
def get_timeline(customer_id: int, db: Session = Depends(get_db)):
    events = []
    
    # 1. Fetch real PQRSF creation events
    pqrsfs = db.query(models.Pqrsf).filter(models.Pqrsf.cliente_id == customer_id).all()
    for pqrsf in pqrsfs:
        events.append(TimelineEventResponse(
            id=f"pqrsf_creada_{pqrsf.id}",
            event_type="Creación de Ticket",
            title=f"Ticket {pqrsf.consecutivo} creado",
            description=pqrsf.asunto,
            date=pqrsf.fecha_creacion,
            source="PQRSF",
            metadata={"estado": pqrsf.estado_rel.name if pqrsf.estado_rel else "N/A", "prioridad": pqrsf.prioridad_rel.name if pqrsf.prioridad_rel else "N/A"}
        ))
        
    # 2. Add some Mock events for demonstration of the unified contract
    now = datetime.utcnow()
    events.extend([
        TimelineEventResponse(
            id="mock_evt_1",
            event_type="Reunión",
            title="QBR Trimestral completado",
            description="Revisión de métricas de servicio con el equipo del cliente.",
            date=now - timedelta(days=15),
            source="Calendario"
        ),
        TimelineEventResponse(
            id="mock_evt_2",
            event_type="Stakeholder",
            title="Nuevo Contacto Técnico",
            description="Ana López fue registrada como líder de infraestructura.",
            date=now - timedelta(days=30),
            source="Directorio"
        ),
        TimelineEventResponse(
            id="mock_evt_3",
            event_type="Contrato",
            title="Firma de Anexo",
            description="Se firmó la ampliación de 5 enlaces adicionales.",
            date=now - timedelta(days=45),
            source="Planview"
        )
    ])
    
    # Sort chronologically (descending)
    events.sort(key=lambda e: e.date, reverse=True)
    
    return events
