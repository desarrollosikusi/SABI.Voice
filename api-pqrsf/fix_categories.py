import os
from database import SessionLocal
from models import CaseCategory
from sqlalchemy.orm.attributes import flag_modified
import json

def fix_categories():
    db = SessionLocal()
    try:
        pqrsf = db.query(CaseCategory).filter(CaseCategory.code == "PQRSF").first()
        if pqrsf:
            schema = pqrsf.form_schema or {}
            schema["allowed_type_codes"] = ["PETITION", "COMPLAINT", "CLAIM", "SUGGESTION", "PRAISE", "INCIDENT", "PROBLEM"]
            pqrsf.form_schema = schema
            flag_modified(pqrsf, "form_schema")
            
        solicitud = db.query(CaseCategory).filter(CaseCategory.code == "SOLICITUD_CLIENTE").first()
        if solicitud:
            schema = solicitud.form_schema or {}
            schema["allowed_type_codes"] = ["REQUEST", "INQUIRY"]
            solicitud.form_schema = schema
            flag_modified(solicitud, "form_schema")
            
        db.commit()
        print("Fixed form_schema!")
    except Exception as e:
        print("Error:", e)
    finally:
        db.close()

if __name__ == "__main__":
    fix_categories()
