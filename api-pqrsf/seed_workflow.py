import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import WorkflowState, WorkflowTransition, Base
from database import get_db, SQLALCHEMY_DATABASE_URL

def seed_workflow():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    # 1. Asegurar Estados
    state_names = ["Abierto", "En Análisis", "En Gestión", "Pendiente Cliente", "Resuelto", "Cerrado", "Reabierto"]
    
    for name in state_names:
        state = db.query(WorkflowState).filter(WorkflowState.name == name).first()
        if not state:
            is_initial = name == "Abierto"
            is_final = name == "Cerrado"
            sla_paused = name == "Pendiente Cliente"
            new_state = WorkflowState(name=name, is_initial=is_initial, is_final=is_final, sla_paused=sla_paused)
            db.add(new_state)
    
    db.commit()

    # 2. Configurar Transiciones
    transitions_data = [
        {"from": "Abierto", "to": "En Análisis", "roles": "*", "note": False, "assign": True, "evidence": False},
        {"from": "En Análisis", "to": "En Gestión", "roles": "*", "note": True, "assign": False, "evidence": False},
        {"from": "En Gestión", "to": "Pendiente Cliente", "roles": "*", "note": True, "assign": False, "evidence": False},
        {"from": "Pendiente Cliente", "to": "En Gestión", "roles": "*", "note": True, "assign": False, "evidence": False},
        {"from": "En Gestión", "to": "Resuelto", "roles": "*", "note": True, "assign": False, "evidence": True},
        {"from": "Resuelto", "to": "Cerrado", "roles": "Admin", "note": True, "assign": False, "evidence": False},
        {"from": "Resuelto", "to": "Reabierto", "roles": "Admin", "note": True, "assign": True, "evidence": False},
    ]

    for t_data in transitions_data:
        from_st = db.query(WorkflowState).filter(WorkflowState.name == t_data["from"]).first()
        to_st = db.query(WorkflowState).filter(WorkflowState.name == t_data["to"]).first()

        existing_transition = db.query(WorkflowTransition).filter(
            WorkflowTransition.from_state_id == from_st.id,
            WorkflowTransition.to_state_id == to_st.id
        ).first()

        if not existing_transition:
            trans = WorkflowTransition(
                from_state_id=from_st.id,
                to_state_id=to_st.id,
                allowed_roles=t_data["roles"],
                require_note=t_data["note"],
                require_assignment=t_data["assign"],
                require_evidence=t_data["evidence"]
            )
            db.add(trans)
        else:
            existing_transition.allowed_roles = t_data["roles"]
            existing_transition.require_note = t_data["note"]
            existing_transition.require_assignment = t_data["assign"]
            existing_transition.require_evidence = t_data["evidence"]

    db.commit()
    print("Flujo de Workflows configurado exitosamente.")
    db.close()

if __name__ == "__main__":
    seed_workflow()
