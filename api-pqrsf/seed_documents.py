import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models import DocumentCategory

def seed_categories():
    db = SessionLocal()
    categories = [
        {
            "code": "REPORT",
            "name": "Informes de Servicio",
            "ui_metadata": {
                "badge": {"label": "Informes de Servicio", "icon": "FileText", "color": "#0ea5e9", "background": "#e0f2fe"},
                "views": { "list": {"sort": 10, "featured": True} }
            }
        },
        {
            "code": "MANUAL",
            "name": "Manuales",
            "ui_metadata": {
                "badge": {"label": "Manuales", "icon": "BookOpen", "color": "#d97706", "background": "#fef3c7"},
                "views": { "list": {"sort": 20, "featured": False} }
            }
        },
        {
            "code": "MINUTE",
            "name": "Actas",
            "ui_metadata": {
                "badge": {"label": "Actas", "icon": "ClipboardList", "color": "#9333ea", "background": "#f3e8ff"},
                "views": { "list": {"sort": 30, "featured": False} }
            }
        },
        {
            "code": "CONTRACT",
            "name": "Contratos",
            "ui_metadata": {
                "badge": {"label": "Contratos", "icon": "FileSignature", "color": "#16a34a", "background": "#dcfce7"},
                "views": { "list": {"sort": 40, "featured": True} }
            }
        },
        {
            "code": "POLICY",
            "name": "Políticas",
            "ui_metadata": {
                "badge": {"label": "Políticas", "icon": "ShieldCheck", "color": "#e11d48", "background": "#ffe4e6"},
                "views": { "list": {"sort": 50, "featured": False} }
            }
        },
        {
            "code": "TEMPLATE",
            "name": "Formatos",
            "ui_metadata": {
                "badge": {"label": "Formatos", "icon": "LayoutTemplate", "color": "#4b5563", "background": "#f3f4f6"},
                "views": { "list": {"sort": 60, "featured": False} }
            }
        },
        {
            "code": "CERTIFICATE",
            "name": "Certificados",
            "ui_metadata": {
                "badge": {"label": "Certificados", "icon": "Award", "color": "#0d9488", "background": "#ccfbf1"},
                "views": { "list": {"sort": 70, "featured": True} }
            }
        },
        {
            "code": "OTHER",
            "name": "Otros",
            "ui_metadata": {
                "badge": {"label": "Otros", "icon": "File", "color": "#64748b", "background": "#f1f5f9"},
                "views": { "list": {"sort": 80, "featured": False} }
            }
        }
    ]
    try:
        for cat_data in categories:
            existing = db.query(DocumentCategory).filter(DocumentCategory.name == cat_data["name"]).first()
            if not existing:
                existing = db.query(DocumentCategory).filter(DocumentCategory.code == cat_data["code"]).first()
            
            if existing:
                existing.code = cat_data["code"]
                existing.name = cat_data["name"]
                existing.ui_metadata = cat_data["ui_metadata"]
            else:
                new_cat = DocumentCategory(
                    code=cat_data["code"],
                    name=cat_data["name"],
                    ui_metadata=cat_data["ui_metadata"],
                    is_active=True
                )
                db.add(new_cat)
        db.commit()
        print("Categories seeded successfully!")
    except Exception as e:
        print(f"Error seeding categories: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_categories()
