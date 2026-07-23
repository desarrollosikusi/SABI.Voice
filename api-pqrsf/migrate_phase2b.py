import os
from sqlalchemy import text
from database import SessionLocal, engine
from models import CaseCategory

def run_migration():
    db = SessionLocal()
    try:
        # 1. Add column `sequence_prefix` to `case_categories` if it doesn't exist
        with engine.begin() as conn:
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='case_categories' AND column_name='sequence_prefix'"))
            if not result.fetchone():
                conn.execute(text("ALTER TABLE case_categories ADD COLUMN sequence_prefix VARCHAR(10)"))
                print("Column 'sequence_prefix' added to case_categories")
            else:
                print("Column 'sequence_prefix' already exists in case_categories")
        
        # 2. Update existing categories with their respective prefixes
        pqrsf = db.query(CaseCategory).filter(CaseCategory.code == "PQRSF").first()
        if pqrsf:
            pqrsf.sequence_prefix = "PQR"
            
        sol = db.query(CaseCategory).filter(CaseCategory.code == "SOLICITUD_CLIENTE").first()
        if sol:
            sol.sequence_prefix = "SOL"
            
        db.commit()
        print("Migration for Phase 2b completed successfully.")
        
    except Exception as e:
        db.rollback()
        print(f"Error during migration: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
