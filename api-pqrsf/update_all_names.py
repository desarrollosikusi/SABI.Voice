from database import SessionLocal
import models
from schemas import normalize_customer_name

db = SessionLocal()
try:
    customers = db.query(models.Customer).all()
    for customer in customers:
        new_name = normalize_customer_name(customer.name)
        if new_name != customer.name:
            print(f"Updating '{customer.name}' to '{new_name}'")
            customer.name = new_name
    db.commit()
    print("All customers updated.")
finally:
    db.close()
