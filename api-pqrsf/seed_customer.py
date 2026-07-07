from auth import get_password_hash
from database import SessionLocal
import models

def create_test_customer():
    db = SessionLocal()
    
    # 1. Asegurar que existe un cliente de prueba
    customer = db.query(models.Customer).filter(models.Customer.name == 'Cliente Demo').first()
    if not customer:
        customer = models.Customer(name='Cliente Demo', nit='900123456', sector='Tecnología')
        db.add(customer)
        db.commit()
        db.refresh(customer)

    # 2. Asegurar que existe un contacto de prueba
    contact = db.query(models.Contact).filter(models.Contact.email == 'demo@cliente.com').first()
    if not contact:
        contact = models.Contact(
            customer_id=customer.id,
            name='Usuario Demo',
            email='demo@cliente.com',
            authorized_for_pqrsf=True,
            is_active=True
        )
        db.add(contact)
    
    # Set the password to "demo123"
    contact.password_hash = get_password_hash('demo123')
    db.commit()
    print("Usuario creado/actualizado: Correo: demo@cliente.com, Contraseña: demo123")
    db.close()

if __name__ == "__main__":
    create_test_customer()
