import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal
from models import User
from auth import get_password_hash

sdms = [
    "DAGO ARMANDO LEON BARAHONA",
    "LINA ESPERANZA LOZANO DEVIA",
    "IVAN DARIO GONZALEZ GONZALEZ",
    "AURA MILAGROS RAMIREZ VELA",
    "JUAN CARLOS PEREZ NIETO"
]

db = SessionLocal()
try:
    for sdm in sdms:
        parts = sdm.split()
        if len(parts) > 1:
            base_username = f"{parts[0].lower()}.{parts[1].lower()}"
        else:
            base_username = sdm.lower()
            
        username = base_username
        email = f"{username}@ikusi.com"
        
        counter = 1
        while db.query(User).filter((User.username == username) | (User.email == email)).first():
            username = f"{base_username}{counter}"
            email = f"{username}@ikusi.com"
            counter += 1

        new_user = User(
            name=sdm,
            email=email,
            username=username,
            password_hash=get_password_hash("Temporal123*"),
            role="Operaciones",
            job_title="SDM"
        )
        db.add(new_user)
    db.commit()
    print("SDMs added successfully.")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
