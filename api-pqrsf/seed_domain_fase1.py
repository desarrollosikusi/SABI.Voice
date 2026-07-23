import os
from database import SessionLocal
from models import CaseCategory, CaseSource, Pqrsf
import json

def seed_domain():
    db = SessionLocal()
    try:
        # Seed Sources
        sources = [
            {"code": "PORTAL_CLIENTE", "name": "Portal Cliente"},
            {"code": "PORTAL_INTERNO", "name": "Portal Interno"},
            {"code": "CORREO", "name": "Correo Electrónico"},
            {"code": "TELEFONO", "name": "Teléfono"},
            {"code": "REUNION", "name": "Reunión"},
            {"code": "API", "name": "API Integración"}
        ]
        
        for source_data in sources:
            existing = db.query(CaseSource).filter(CaseSource.code == source_data["code"]).first()
            if not existing:
                new_source = CaseSource(**source_data)
                db.add(new_source)
        
        db.commit()

        # Seed Categories
        categories = [
            {
                "code": "PQRSF", 
                "name": "PQRSF", 
                "description": "Peticiones, Quejas, Reclamos, Sugerencias y Felicitaciones", 
                "color": "#10b981", # Verde Institucional
                "icon": "MessageSquare", # Representando conversación/atención
                "display_order": 1
            },
            {
                "code": "SOLICITUD_CLIENTE", 
                "name": "Solicitud al Cliente", 
                "description": "Requerimientos de información, documentación o aprobación hacia el cliente", 
                "color": "#3b82f6", # Azul Corporativo
                "icon": "FileText", # Representando documentos/solicitud
                "display_order": 2
            }
        ]

        for cat_data in categories:
            existing = db.query(CaseCategory).filter(CaseCategory.code == cat_data["code"]).first()
            if not existing:
                new_cat = CaseCategory(**cat_data)
                db.add(new_cat)
        
        db.commit()
        
        # Link existing PQRSFs to PQRSF category to avoid breaking changes (backward compatibility)
        pqrsf_category = db.query(CaseCategory).filter(CaseCategory.code == "PQRSF").first()
        portal_cliente_source = db.query(CaseSource).filter(CaseSource.code == "PORTAL_CLIENTE").first()
        
        if pqrsf_category:
            existing_cases = db.query(Pqrsf).filter(Pqrsf.category_id == None).all()
            for case in existing_cases:
                case.category_id = pqrsf_category.id
                if not case.source_id and portal_cliente_source:
                    case.source_id = portal_cliente_source.id
            db.commit()
            print(f"Migrated {len(existing_cases)} legacy cases to PQRSF category.")

        print("Fase 1 Domain seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding domain: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_domain()
