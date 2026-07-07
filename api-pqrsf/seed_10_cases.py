import datetime
from database import SessionLocal
import models
import random

def seed_10_cases():
    db = SessionLocal()
    
    customer = db.query(models.Customer).filter(models.Customer.name == 'Cliente Demo').first()
    if not customer:
        print("Cliente Demo no existe.")
        return

    contact = db.query(models.Contact).filter(models.Contact.email == 'demo@cliente.com').first()
    if not contact:
        print("Contacto demo no existe.")
        return

    cases_data = [
        {"estado_id": 1, "asunto": "Error al iniciar sesión en app", "estado_sla": "En tiempo"},
        {"estado_id": 5, "asunto": "Solicitud de nuevo reporte financiero", "estado_sla": "En tiempo"},
        {"estado_id": 5, "asunto": "Lentitud en la consulta de inventarios", "estado_sla": "Vencido"},
        {"estado_id": 6, "asunto": "Duda sobre configuración de usuarios", "estado_sla": "En tiempo"},
        {"estado_id": 6, "asunto": "Falta adjuntar factura para el reclamo", "estado_sla": "En tiempo"},
        {"estado_id": 6, "asunto": "Confirmar datos de envío", "estado_sla": "Vencido"},
        {"estado_id": 8, "asunto": "Cambio de contraseña realizado", "estado_sla": "En tiempo"},
        {"estado_id": 9, "asunto": "Instalación de servidor concluida", "estado_sla": "En tiempo", "fecha_cierre": datetime.datetime.utcnow()},
        {"estado_id": 1, "asunto": "Queja por mala atención telefónica", "estado_sla": "Vencido"},
        {"estado_id": 5, "asunto": "Revisión de logs de seguridad", "estado_sla": "En tiempo"},
    ]

    for i, data in enumerate(cases_data):
        pqrsf = models.Pqrsf(
            consecutivo=f"SABI-{datetime.datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}",
            customer_id=customer.id,
            contact_id=contact.id,
            cliente_empresa=customer.name,
            correo=contact.email,
            asunto=data["asunto"],
            descripcion="Descripción detallada de prueba generada automáticamente.",
            tipo_id=1,
            area_id=1,
            prioridad_id=1,
            estado_id=data["estado_id"],
            estado_sla=data["estado_sla"],
            fecha_cierre=data.get("fecha_cierre")
        )
        db.add(pqrsf)
    
    try:
        db.commit()
        print("Se insertaron 10 casos de prueba exitosamente.")
    except Exception as e:
        db.rollback()
        print(f"Error insertando: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_10_cases()
