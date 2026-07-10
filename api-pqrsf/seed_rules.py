import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import OperationalRule, Base
from database import get_db, SQLALCHEMY_DATABASE_URL

def seed_rules():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    rules_data = [
        {
            "name": "Alerta Preventiva (24h sin estado)",
            "description": "Publicar evento si un caso pasa más de 24 horas sin cambiar de estado (excepto Resuelto/Cerrado).",
            "priority": 50,
            "entity_type": "pqrsf",
            "conditions": {
                "AND": [
                    {"field": "minutos_en_estado", "operator": ">=", "value": 1440},
                    {"field": "estado_nombre", "operator": "NOT_IN", "value": ["Resuelto", "Cerrado", "Cancelado"]}
                ]
            },
            "action_type": "PUBLISH_EVENT",
            "action_payload": {
                "event_type": "SLA_WARNING",
                "severity": "Advertencia",
                "title": "Caso Estancado (> 24h)",
                "description": "El caso no ha avanzado de estado en las últimas 24 horas.",
                "channel": "all"
            }
        },
        {
            "name": "Cierre por abandono",
            "description": "Si el caso lleva más de 3 días (4320 mins) en Pendiente Cliente, mover a Resuelto.",
            "priority": 90,
            "entity_type": "pqrsf",
            "conditions": {
                "AND": [
                    {"field": "estado_nombre", "operator": "==", "value": "Pendiente Cliente"},
                    {"field": "minutos_en_estado", "operator": ">=", "value": 4320}
                ]
            },
            "action_type": "TRANSITION_STATE",
            "action_payload": {
                "to_state_name": "Resuelto",
                "note": "Cierre automático por falta de respuesta del cliente durante más de 3 días.",
                "evidence_url": "sabi:system/auto-close"
            }
        },
        {
            "name": "Alerta: Múltiples Casos Críticos",
            "description": "Publicar evento crítico si el cliente tiene 3 o más quejas críticas abiertas.",
            "priority": 100,
            "entity_type": "customer",
            "conditions": {
                "field": "critical_open_cases",
                "operator": ">=",
                "value": 3
            },
            "action_type": "PUBLISH_EVENT",
            "action_payload": {
                "event_type": "CRITICAL_CUSTOMER_RISK",
                "severity": "Crítico",
                "title": "Riesgo de Abandono Cliente",
                "description": "El cliente tiene 3 o más casos críticos abiertos simultáneamente.",
                "channel": "executive"
            }
        }
    ]

    for data in rules_data:
        existing = db.query(OperationalRule).filter(OperationalRule.name == data["name"]).first()
        if not existing:
            rule = OperationalRule(
                name=data["name"],
                description=data["description"],
                priority=data["priority"],
                entity_type=data["entity_type"],
                conditions=data["conditions"],
                action_type=data["action_type"],
                action_payload=data["action_payload"]
            )
            db.add(rule)
        else:
            existing.conditions = data["conditions"]
            existing.action_type = data["action_type"]
            existing.action_payload = data["action_payload"]
            existing.priority = data["priority"]
            existing.entity_type = data["entity_type"]

    db.commit()
    print("Reglas operativas sembradas exitosamente.")
    db.close()

if __name__ == "__main__":
    seed_rules()
