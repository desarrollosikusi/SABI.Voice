import os
from database import SessionLocal
from models import CaseCategory, CaseSource, Pqrsf
import json

def update_categories_metadata():
    db = SessionLocal()
    try:
        pqrsf = db.query(CaseCategory).filter(CaseCategory.code == "PQRSF").first()
        if pqrsf:
            pqrsf.form_schema = {
                "ui_features": [
                    "Atención y gestión por IKUSI",
                    "Clasificación automática con IA",
                    "Seguimiento de SLA"
                ],
                "ui_footer": "Gestión interna por IKUSI",
                "ui_badge": "RECOMENDADO",
                "ui_button_text": "Crear PQRSF"
            }

        solicitud = db.query(CaseCategory).filter(CaseCategory.code == "SOLICITUD_CLIENTE").first()
        if solicitud:
            solicitud.form_schema = {
                "ui_features": [
                    "Pendiente de gestión del cliente",
                    "Identifica el área originadora",
                    "Seguimiento y control de respuesta"
                ],
                "ui_footer": "Gestión del cliente",
                "ui_button_text": "Crear Solicitud"
            }
            
        db.commit()
        print("Categories metadata updated successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error updating categories: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    update_categories_metadata()
