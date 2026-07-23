import os
from sqlalchemy import text
from database import SessionLocal, engine
from models import PqrsfType, CaseCategory

def run_migration():
    db = SessionLocal()
    try:
        # 1. Add column `code` to `pqrsf_types` if it doesn't exist
        with engine.begin() as conn:
            # Check if column exists
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='pqrsf_types' AND column_name='code'"))
            if not result.fetchone():
                conn.execute(text("ALTER TABLE pqrsf_types ADD COLUMN code VARCHAR(50) UNIQUE"))
                print("Column 'code' added to pqrsf_types")
            else:
                print("Column 'code' already exists in pqrsf_types")
        
        # 2. Update existing PqrsfTypes with their respective codes
        type_mapping = {
            "Solicitud": "REQUEST",
            "Consulta": "INQUIRY",
            "Petición": "PETITION",
            "Queja": "COMPLAINT",
            "Reclamo": "CLAIM",
            "Sugerencia": "SUGGESTION",
            "Felicitación": "PRAISE",
            "Incidente": "INCIDENT",
            "Problema": "PROBLEM"
        }
        
        types = db.query(PqrsfType).all()
        for t in types:
            if t.name in type_mapping:
                t.code = type_mapping[t.name]
            elif not t.code:
                # Fallback to uppercase name without spaces
                t.code = t.name.upper().replace(" ", "_")
        
        # 3. Update case_categories form_schema
        pqrsf_cat = db.query(CaseCategory).filter(CaseCategory.code == "PQRSF").first()
        if pqrsf_cat:
            schema = pqrsf_cat.form_schema or {}
            schema["allowed_type_codes"] = ["PETITION", "COMPLAINT", "CLAIM", "SUGGESTION", "PRAISE", "INCIDENT", "PROBLEM"]
            # SQLAlchemy JSON mutation detection workaround: reassign
            pqrsf_cat.form_schema = dict(schema)
            
        solicitud_cat = db.query(CaseCategory).filter(CaseCategory.code == "SOLICITUD_CLIENTE").first()
        if solicitud_cat:
            schema = solicitud_cat.form_schema or {}
            schema["allowed_type_codes"] = ["REQUEST", "INQUIRY"]
            solicitud_cat.form_schema = dict(schema)

        db.commit()
        print("Migration and metadata population completed successfully.")
        
    except Exception as e:
        db.rollback()
        print(f"Error during migration: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
