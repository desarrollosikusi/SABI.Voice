import os
import sys

# Ensure api-pqrsf is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models import Customer, Contact
from auth import get_password_hash

def main():
    db = SessionLocal()
    
    clients_data = [
        {"name": "Bancolombia", "domain": "bancolombia.com"},
        {"name": "Coca Cola", "domain": "cocacola.com"},
        {"name": "OXXO", "domain": "oxxo.com"},
        {"name": "Banco de Bogotá", "domain": "bancodebogota.com"},
        {"name": "MinHacienda", "domain": "minhacienda.gov.co"},
    ]

    password_hash = get_password_hash("password123")

    for cdata in clients_data:
        customer = db.query(Customer).filter(Customer.name.ilike(f"%{cdata['name']}%")).first()
        if not customer:
            customer = Customer(name=cdata['name'], criticality='Estándar')
            db.add(customer)
            db.commit()
            db.refresh(customer)
            print(f"Created customer {customer.name}")
        else:
            print(f"Customer {customer.name} already exists")
            
        for i in range(1, 3):
            email = f"contacto{i}@{cdata['domain']}"
            contact = db.query(Contact).filter(Contact.email == email).first()
            if not contact:
                contact = Contact(
                    customer_id=customer.id,
                    name=f"Contacto {i} de {cdata['name']}",
                    email=email,
                    authorized_for_pqrsf=True,
                    is_active=True,
                    password_hash=password_hash
                )
                db.add(contact)
                db.commit()
                print(f"Created contact {email} for {customer.name}")
            else:
                contact.password_hash = password_hash
                contact.authorized_for_pqrsf = True
                db.commit()
                print(f"Contact {email} already exists. Updated password.")

    db.close()

if __name__ == "__main__":
    main()
