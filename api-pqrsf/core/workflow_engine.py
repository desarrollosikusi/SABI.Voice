from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import models
from notifications.provider import get_event_publisher, OperationalEventPayload

class WorkflowService:
    def __init__(self, db: Session):
        self.db = db
        self.publisher = get_event_publisher(db)

    def get_allowed_transitions(self, from_state_id: int, user_role: str) -> List[models.WorkflowTransition]:
        """
        Returns a list of allowed transitions from a given state for a specific role.
        """
        transitions = self.db.query(models.WorkflowTransition).filter(
            models.WorkflowTransition.from_state_id == from_state_id,
            models.WorkflowTransition.is_active == True
        ).all()

        allowed = []
        for t in transitions:
            # Check if role is allowed
            if not t.allowed_roles or t.allowed_roles == "*" or user_role in [r.strip() for r in t.allowed_roles.split(",")]:
                allowed.append(t)
                
        return allowed

    def execute_pqrsf_transition(
        self, 
        pqrsf_id: int, 
        to_state_id: int, 
        user: models.User, 
        note: Optional[str] = None,
        assigned_to: Optional[int] = None,
        evidence_url: Optional[str] = None
    ) -> models.Pqrsf:
        
        pqrsf = self.db.query(models.Pqrsf).filter(models.Pqrsf.id == pqrsf_id).first()
        if not pqrsf:
            raise ValueError("PQRSF not found")

        if pqrsf.estado_id == to_state_id:
            raise ValueError("El caso ya se encuentra en el estado solicitado.")

        # Verify Transition
        transition = self.db.query(models.WorkflowTransition).filter(
            models.WorkflowTransition.from_state_id == pqrsf.estado_id,
            models.WorkflowTransition.to_state_id == to_state_id,
            models.WorkflowTransition.is_active == True
        ).first()

        if not transition:
            raise ValueError("Transición de estado no permitida en el flujo actual.")

        # Verify Role Permissions
        user_role_name = user.role.name if user.role else "Unknown"
        if transition.allowed_roles and transition.allowed_roles != "*":
            allowed_roles_list = [r.strip() for r in transition.allowed_roles.split(",")]
            if user_role_name not in allowed_roles_list:
                raise ValueError(f"El rol '{user_role_name}' no tiene permisos para ejecutar esta transición.")

        # Verify Required Fields
        if transition.require_note and not note:
            raise ValueError("Esta transición requiere una nota justificativa obligatoria.")
        
        if transition.require_assignment and not assigned_to and not pqrsf.responsable_id:
            raise ValueError("Esta transición requiere que el caso tenga un responsable asignado.")
            
        if transition.require_evidence and not evidence_url:
            raise ValueError("Esta transición requiere proveer evidencia (URL o identificador).")

        # Execute Transaction
        old_state_id = pqrsf.estado_id
        
        pqrsf.estado_id = to_state_id
        
        if assigned_to:
            pqrsf.responsable_id = assigned_to
            
        # Register Note if provided
        full_note = ""
        if note:
            full_note += note
        if evidence_url:
            full_note += f"\nEvidencia: {evidence_url}"
            
        if full_note:
            comm = models.CaseCommunication(
                pqrsf_id=pqrsf.id,
                tipo_contacto="Nota Interna",
                mensaje=full_note,
                autor_id=user.id,
                es_interno=True
            )
            self.db.add(comm)

        # Calculate time spent in previous state
        last_history = self.db.query(models.CaseStatusHistory).filter(
            models.CaseStatusHistory.pqrsf_id == pqrsf.id
        ).order_by(models.CaseStatusHistory.fecha.desc()).first()
        
        tiempo_permanencia = None
        if last_history:
            tiempo_permanencia = int((datetime.utcnow() - last_history.fecha).total_seconds() / 60)
        else:
            tiempo_permanencia = int((datetime.utcnow() - pqrsf.fecha_creacion).total_seconds() / 60)

        # Record CaseStatusHistory
        status_history = models.CaseStatusHistory(
            pqrsf_id=pqrsf.id,
            estado_anterior_id=old_state_id,
            estado_nuevo_id=to_state_id,
            usuario_id=user.id,
            motivo=f"Transición ejecutada por motor: {transition.id}",
            tiempo_permanencia_minutos=tiempo_permanencia
        )
        self.db.add(status_history)
        
        # Guardar en DB para que los objetos relacionales (estado) estén disponibles para el payload
        self.db.commit()
        self.db.refresh(pqrsf)

        # Publish Event
        self.publisher.publish(OperationalEventPayload(
            event_type="PQRSF_STATE_CHANGED",
            origin="WORKFLOW_ENGINE",
            severity="Información",
            title=f"Cambio de Estado: {pqrsf.consecutivo}",
            description=f"El caso ha avanzado al estado '{pqrsf.estado.name}'.",
            channel="all",
            entity_type="pqrsf",
            entity_id=pqrsf.id,
            customer_id=pqrsf.cliente_id,
            recommended_action="Revisar nuevas asignaciones o notas.",
            metadata={
                "from_state_id": old_state_id,
                "to_state_id": to_state_id,
                "user_id": user.id
            }
        ))

        return pqrsf
