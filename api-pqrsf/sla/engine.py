import asyncio
from datetime import datetime
from database import SessionLocal
import models
from notifications.provider import get_notification_provider

async def sla_monitor_task():
    """
    Background task to monitor SLAs and mark tickets as Vencido.
    It will skip calculating SLA for states where sla_paused is True.
    """
    while True:
        try:
            with SessionLocal() as db:
                check_slas(db)
        except Exception as e:
            print(f"Error in SLA monitor: {e}")
            
        # Poll every 60 seconds
        await asyncio.sleep(60)

def check_slas(db):
    now = datetime.utcnow()
    
    # 1. Fetch all non-closed, non-cancelled tickets that are not in an SLA paused state
    # To do this efficiently, we can query tickets and their current state
    tickets = db.query(models.Pqrsf).filter(
        models.Pqrsf.estado_sla != "Vencido",
        models.Pqrsf.fecha_vencimiento < now
    ).all()
    
    provider = get_notification_provider()
    
    for ticket in tickets:
        # Check if the current state pauses SLA
        state = db.query(models.WorkflowState).filter(models.WorkflowState.name == ticket.estado).first()
        
        if state and state.sla_paused:
            continue # SLA is paused in this state, do not mark as Vencido
            
        if not state or not state.is_final:
            ticket.estado_sla = "Vencido"
            db.commit()
            
            # Send notification
            recipient = "Administrador"
            if ticket.responsable_id:
                user = db.query(models.User).filter(models.User.id == ticket.responsable_id).first()
                if user:
                    recipient = user.username
                    
            provider.send(
                recipient=recipient,
                subject=f"🚨 SLA Vencido: {ticket.consecutivo}",
                message=f"El caso {ticket.consecutivo} ha superado su fecha objetivo y se encuentra Vencido."
            )
            
            # Log in history
            hist = models.PqrsfHistory(
                pqrsf_id=ticket.id, 
                accion="SLA", 
                descripcion="El estado SLA pasó a Vencido por el sistema", 
            )
            db.add(hist)
            db.commit()
