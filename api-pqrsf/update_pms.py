import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal
from models import User
from sqlalchemy import text

def update():
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN job_title VARCHAR(100);"))
        except Exception as e:
            print(f"job_title column might already exist: {e}")
            
    db = SessionLocal()
    try:
        pms = [
            "DIANA KATHERINE CASTAÑO CUEVAS",
            "ANDREA DEL PILAR GOMEZ TORRES",
            "JENNYFER ANDREA SALAS PABON",
            "MARY STEFHANY SOTO LUQUE",
            "OSCAR FERNANDO DIAZ QUINTERO",
            "SANDRA LILIANA SANCHEZ CASTAÑEDA",
            "LUZ STELLA SUAREZ ROBLES"
        ]
        users = db.query(User).filter(User.name.in_(pms)).all()
        for u in users:
            u.job_title = "PM"
        db.commit()
        print(f"Updated {len(users)} PMs.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    update()
