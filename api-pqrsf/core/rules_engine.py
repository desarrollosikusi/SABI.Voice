import json
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
from notifications.provider import get_event_publisher, OperationalEventPayload
from core.workflow_engine import WorkflowService

class RuleEvaluator:
    """
    Evaluates a JSON condition tree against a given entity data dictionary.
    Supports basic operators: ==, !=, >, >=, <, <=, IN, NOT_IN.
    """
    def evaluate(self, conditions: Dict[str, Any], context_data: Dict[str, Any]) -> bool:
        if not conditions:
            return True
        
        # Simple logical AND evaluation for a list of conditions
        if isinstance(conditions, list):
            return all(self._eval_single(cond, context_data) for cond in conditions)
        
        # If it's a dict with logical operators
        if "AND" in conditions:
            return all(self.evaluate(c, context_data) for c in conditions["AND"])
        if "OR" in conditions:
            return any(self.evaluate(c, context_data) for c in conditions["OR"])
            
        return self._eval_single(conditions, context_data)

    def _eval_single(self, condition: Dict[str, Any], context_data: Dict[str, Any]) -> bool:
        field = condition.get("field")
        op = condition.get("operator", "==")
        value = condition.get("value")
        
        if not field or field not in context_data:
            return False
            
        actual_value = context_data[field]
        
        if op == "==":
            return actual_value == value
        elif op == "!=":
            return actual_value != value
        elif op == ">":
            return actual_value > value if actual_value is not None else False
        elif op == ">=":
            return actual_value >= value if actual_value is not None else False
        elif op == "<":
            return actual_value < value if actual_value is not None else False
        elif op == "<=":
            return actual_value <= value if actual_value is not None else False
        elif op == "IN":
            return actual_value in value if isinstance(value, list) else False
        elif op == "NOT_IN":
            return actual_value not in value if isinstance(value, list) else False
            
        return False

class RuleExecutor:
    """
    Executes actions based on rule decisions. Designed to be easily extensible.
    """
    def __init__(self, db: Session, dry_run: bool = False):
        self.db = db
        self.dry_run = dry_run
        self.publisher = get_event_publisher(db)
        self.workflow_engine = WorkflowService(db)
        # Using a system user for automated actions
        self.system_user = self.db.query(models.User).filter(models.User.username == "sistema").first()
        if not self.system_user:
            # Fallback to Admin if no system user exists
            self.system_user = self.db.query(models.User).filter(models.User.role == "Administrador").first()

    def execute(self, action_type: str, action_payload: Dict[str, Any], entity_id: int, entity_type: str, entity_obj: Any):
        if self.dry_run:
            print(f"[DRY RUN] Would execute: {action_type} on {entity_type} {entity_id} with payload {action_payload}")
            return
            
        if action_type == "PUBLISH_EVENT":
            self._publish_event(action_payload, entity_id, entity_type, entity_obj)
        elif action_type == "TRANSITION_STATE":
            self._transition_state(action_payload, entity_id, entity_type, entity_obj)
        # Future actions: SEND_NOTIFICATION, CREATE_TASK, EXECUTE_WEBHOOK, etc.
        else:
            print(f"Unknown action_type: {action_type}")

    def _publish_event(self, payload: Dict[str, Any], entity_id: int, entity_type: str, entity_obj: Any):
        event_payload = OperationalEventPayload(
            event_type=payload.get("event_type", "RULE_TRIGGERED"),
            origin="RULES_ENGINE",
            severity=payload.get("severity", "Advertencia"),
            title=payload.get("title", f"Alerta Automática en {entity_type} {entity_id}"),
            description=payload.get("description", ""),
            channel=payload.get("channel", "all"),
            entity_type=entity_type,
            entity_id=entity_id,
            customer_id=getattr(entity_obj, 'customer_id', getattr(entity_obj, 'id', None) if entity_type == 'customer' else None)
        )
        self.publisher.publish(event_payload)

    def _transition_state(self, payload: Dict[str, Any], entity_id: int, entity_type: str, entity_obj: Any):
        if entity_type == "pqrsf":
            to_state_name = payload.get("to_state_name")
            note = payload.get("note", "Transición automática por Motor de Reglas.")
            
            # Find to_state_id
            state = self.db.query(models.WorkflowState).filter(models.WorkflowState.name == to_state_name).first()
            if not state:
                print(f"State {to_state_name} not found.")
                return
                
            try:
                self.workflow_engine.execute_pqrsf_transition(
                    pqrsf_id=entity_id,
                    to_state_id=state.id,
                    user=self.system_user,
                    note=note,
                    assigned_to=payload.get("assigned_to"),
                    evidence_url=payload.get("evidence_url", "https://sabi.internal/rules-engine")
                )
            except Exception as e:
                print(f"Error executing automated transition: {e}")

class OperationalRulesEngine:
    """
    Orchestrator: Evaluates -> Decides (Idempotency) -> Executes -> Logs.
    """
    def __init__(self, db: Session, dry_run: bool = False):
        self.db = db
        self.dry_run = dry_run
        self.evaluator = RuleEvaluator()
        self.executor = RuleExecutor(db, dry_run=dry_run)

    def _check_idempotency(self, rule_id: int, entity_type: str, entity_id: int, window: str, version: str = "v1") -> bool:
        """
        Returns True if the rule HAS ALREADY been executed in the given window.
        """
        log = self.db.query(models.RuleExecutionLog).filter(
            models.RuleExecutionLog.rule_id == rule_id,
            models.RuleExecutionLog.entity_type == entity_type,
            models.RuleExecutionLog.entity_id == entity_id,
            models.RuleExecutionLog.execution_window == window,
            models.RuleExecutionLog.workflow_version == version
        ).first()
        return log is not None

    def _mark_executed(self, rule_id: int, entity_type: str, entity_id: int, window: str, version: str = "v1"):
        log = models.RuleExecutionLog(
            rule_id=rule_id,
            entity_type=entity_type,
            entity_id=entity_id,
            execution_window=window,
            workflow_version=version
        )
        self.db.add(log)
        self.db.commit()

    def _get_pqrsf_context(self, pqrsf: models.Pqrsf) -> Dict[str, Any]:
        """Extracts operational fields into a dictionary for evaluation."""
        now = datetime.utcnow()
        
        # Calculate time in current state (minutes)
        last_history = self.db.query(models.CaseStatusHistory).filter(
            models.CaseStatusHistory.pqrsf_id == pqrsf.id
        ).order_by(models.CaseStatusHistory.fecha.desc()).first()
        
        if last_history:
            mins_in_state = int((now - last_history.fecha).total_seconds() / 60)
        else:
            mins_in_state = int((now - pqrsf.fecha_creacion).total_seconds() / 60)
            
        return {
            "id": pqrsf.id,
            "estado_nombre": pqrsf.estado.name if pqrsf.estado else "",
            "prioridad_nombre": pqrsf.prioridad.name if pqrsf.prioridad else "",
            "minutos_en_estado": mins_in_state,
            "dias_sin_respuesta": mins_in_state / 1440.0,
            "sla_estado": pqrsf.estado_sla,
            "cliente_id": pqrsf.cliente_id,
            "tiene_responsable": pqrsf.responsable_id is not None
        }
        
    def _get_customer_context(self, customer_id: int) -> Dict[str, Any]:
        """Context for aggregate rules at the customer level."""
        pqrsfs = self.db.query(models.Pqrsf).filter(
            models.Pqrsf.cliente_id == customer_id,
            models.Pqrsf.fecha_cierre == None
        ).all()
        
        critical_count = sum(1 for p in pqrsfs if p.prioridad and p.prioridad.name == "Crítica")
        
        return {
            "id": customer_id,
            "total_open_cases": len(pqrsfs),
            "critical_open_cases": critical_count
        }

    def evaluate_all(self):
        start_time = time.time()
        metrics = {
            "rules_evaluated": 0,
            "rules_triggered": 0,
            "transitions_executed": 0,
            "events_published": 0
        }
        
        # 1. Fetch active rules ordered by priority
        rules = self.db.query(models.OperationalRule).filter(
            models.OperationalRule.is_active == True
        ).order_by(models.OperationalRule.priority.desc()).all()
        
        if not rules:
            return metrics
            
        # 2. Fetch context entities (In a production system this should be optimized/chunked)
        active_pqrsfs = self.db.query(models.Pqrsf).filter(models.Pqrsf.fecha_cierre == None).all()
        
        # Get unique customers with open cases
        active_customer_ids = list(set(p.cliente_id for p in active_pqrsfs if p.cliente_id))
        
        for rule in rules:
            metrics["rules_evaluated"] += 1
            
            if rule.entity_type == "pqrsf":
                for pqrsf in active_pqrsfs:
                    context = self._get_pqrsf_context(pqrsf)
                    
                    if self.evaluator.evaluate(rule.conditions, context):
                        # Construct a unique execution window. 
                        # For simple state-based rules, the 'window' is the state itself. 
                        # So it won't fire twice for the same state.
                        window = f"state_{pqrsf.estado_id}_mins_{context['minutos_en_estado'] // 60}"
                        
                        if not self._check_idempotency(rule.id, "pqrsf", pqrsf.id, window):
                            self.executor.execute(rule.action_type, rule.action_payload, pqrsf.id, "pqrsf", pqrsf)
                            self._mark_executed(rule.id, "pqrsf", pqrsf.id, window)
                            
                            metrics["rules_triggered"] += 1
                            if rule.action_type == "TRANSITION_STATE":
                                metrics["transitions_executed"] += 1
                            elif rule.action_type == "PUBLISH_EVENT":
                                metrics["events_published"] += 1

            elif rule.entity_type == "customer":
                for cid in active_customer_ids:
                    context = self._get_customer_context(cid)
                    
                    if self.evaluator.evaluate(rule.conditions, context):
                        # Window based on current date, so it fires at most once per day per customer
                        window = datetime.utcnow().strftime("%Y-%m-%d")
                        
                        if not self._check_idempotency(rule.id, "customer", cid, window):
                            customer = self.db.query(models.Customer).filter(models.Customer.id == cid).first()
                            self.executor.execute(rule.action_type, rule.action_payload, cid, "customer", customer)
                            self._mark_executed(rule.id, "customer", cid, window)
                            
                            metrics["rules_triggered"] += 1
                            if rule.action_type == "PUBLISH_EVENT":
                                metrics["events_published"] += 1
                                
        metrics["execution_time_ms"] = int((time.time() - start_time) * 1000)
        return metrics
