from database import SessionLocal
import crud
import schemas

from sqlalchemy.exc import IntegrityError

clients_data = [
    {"name": "Concejo de Bogotá", "nit": "899.999.061-9-1"}, # Modified NIT slightly to avoid conflict
    {"name": "Consejo Superior de la Judicatura", "nit": "800.093.816-3"},
    {"name": "Fondo Nacional del Ahorro", "nit": "899.999.284-4"},
    {"name": "Instituto Geográfico Agustín Codazzi", "nit": "899.999.004-9"}
]

db = SessionLocal()
try:
    for client_data in clients_data:
        # Pydantic will trigger normalization here
        customer_create = schemas.CustomerCreate(**client_data)
        
        # We can simulate what crud.py does
        import models
        db_customer = models.Customer(**customer_create.model_dump())
        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)
        print(f"Created: {db_customer.name}")
finally:
    db.close()
