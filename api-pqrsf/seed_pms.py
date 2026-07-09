import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal
from models import User
from auth import get_password_hash

pms = [
    "DIANA KATHERINE CASTAÑO CUEVAS",
    "ANDREA DEL PILAR GOMEZ TORRES",
    "JENNYFER ANDREA SALAS PABON",
    "MARY STEFHANY SOTO LUQUE",
    "OSCAR FERNANDO DIAZ QUINTERO",
    "SANDRA LILIANA SANCHEZ CASTAÑEDA",
    "LUZ STELLA SUAREZ ROBLES"
]

db = SessionLocal()
try:
    for pm in pms:
        parts = pm.split()
        if len(parts) > 1:
            base_username = f"{parts[0].lower()}.{parts[1].lower()}"
        else:
            base_username = pm.lower()
            
        username = base_username
        email = f"{username}@ikusi.com"
        
        counter = 1
        while db.query(User).filter((User.username == username) | (User.email == email)).first():
            username = f"{base_username}{counter}"
            email = f"{username}@ikusi.com"
            counter += 1

        new_user = User(
            name=pm,
            email=email,
            username=username,
            password_hash=get_password_hash("Temporal123*"),
            role="Operaciones"
        )
        db.add(new_user)
    db.commit()
    print("PMs added successfully.")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
