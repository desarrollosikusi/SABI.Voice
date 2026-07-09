import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal
from models import Base
from sqlalchemy import text

def migrate():
    # 1. Create missing tables (this will create audit_logs)
    Base.metadata.create_all(bind=engine)
    print("Base.metadata.create_all executed.")

    # 2. Add columns to contacts table
    db = SessionLocal()
    try:
        # Add columns if they don't exist
        columns = [
            ("deactivation_reporter", "VARCHAR(150)"),
            ("deactivation_support", "TEXT"),
            ("deactivation_date", "TIMESTAMP")
        ]
        
        for col_name, col_type in columns:
            try:
                db.execute(text(f"ALTER TABLE contacts ADD COLUMN {col_name} {col_type};"))
                db.commit()
                print(f"Column {col_name} added to contacts.")
            except Exception as e:
                db.rollback()
                if 'duplicate column name' in str(e).lower() or 'ya existe' in str(e).lower():
                    print(f"Column {col_name} already exists.")
                else:
                    print(f"Error adding {col_name}: {e}")
                    
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
