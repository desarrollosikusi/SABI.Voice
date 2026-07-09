import os
import sys

# Ensure api-pqrsf is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal
from models import Base, EconomicSector
from sqlalchemy import text

def migrate():
    # 1. Create tables that don't exist
    Base.metadata.create_all(bind=engine)
    
    # 2. Alter customers table
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE customers ADD COLUMN razon_social VARCHAR(200);"))
        except Exception as e:
            print(f"razon_social already exists or error: {e}")
            
        try:
            conn.execute(text("ALTER TABLE customers ADD COLUMN direccion_principal VARCHAR(255);"))
        except Exception as e:
            print(f"direccion_principal already exists or error: {e}")
            
        try:
            conn.execute(text("ALTER TABLE customers ADD COLUMN pagina_web VARCHAR(255);"))
        except Exception as e:
            print(f"pagina_web already exists or error: {e}")
            
        try:
            conn.execute(text("ALTER TABLE customers ADD COLUMN telefono_principal VARCHAR(50);"))
        except Exception as e:
            print(f"telefono_principal already exists or error: {e}")
            
        try:
            conn.execute(text("ALTER TABLE customers ADD COLUMN economic_sector_id INTEGER REFERENCES economic_sectors(id) ON DELETE SET NULL;"))
        except Exception as e:
            print(f"economic_sector_id already exists or error: {e}")

    # 3. Seed Economic Sectors
    db = SessionLocal()
    try:
        sectors = [
            "Banca", "Salud", "Sector Público Nacional", "Sector Público Territorial",
            "Educación", "Industria", "Energía", "Telecomunicaciones", "Comercial",
            "Servicios", "Manufactura", "Otro"
        ]
        
        for idx, sector in enumerate(sectors):
            exists = db.query(EconomicSector).filter(EconomicSector.name == sector).first()
            if not exists:
                new_sector = EconomicSector(name=sector, order_index=idx)
                db.add(new_sector)
        db.commit()
        print("Migration completed successfully.")
    except Exception as e:
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
