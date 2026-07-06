import asyncio
from datetime import datetime, timedelta
import logging
from sqlalchemy import func
from database import SessionLocal
import models
from notifications.provider import get_notification_provider

logger = logging.getLogger(__name__)

async def customer_relationship_monitor_task():
    while True:
        try:
            logger.info("Running customer relationship monitor task...")
            
            db = SessionLocal()
            provider = get_notification_provider()
            today = datetime.utcnow().date()
            
            # 1. Cumpleaños
            contacts = db.query(models.Contact).filter(
                func.extract('month', models.Contact.fecha_nacimiento) == today.month,
                func.extract('day', models.Contact.fecha_nacimiento) == today.day,
                models.Contact.is_active == True
            ).all()
            for c in contacts:
                provider.send("Sistema", "BirthdayDetected", f"Cumpleaños de {c.name} {c.apellidos or ''} ({c.customer.name if c.customer else 'Sin Empresa'})")
                
            # 2. Aniversarios
            customers = db.query(models.Customer).filter(
                func.extract('month', models.Customer.fecha_alta_comercial) == today.month,
                func.extract('day', models.Customer.fecha_alta_comercial) == today.day,
                models.Customer.is_active == True
            ).all()
            for cust in customers:
                years = today.year - cust.fecha_alta_comercial.year
                provider.send("Sistema", "CustomerAnniversaryDetected", f"El cliente {cust.name} cumple {years} año(s) de relación comercial.")
                
            # 3. Inactividad (Sin interacciones en 90 días)
            threshold_date = datetime.utcnow() - timedelta(days=90)
            
            # Buscamos clientes activos
            active_customers = db.query(models.Customer).filter(models.Customer.is_active == True).all()
            for cust in active_customers:
                # Buscar ultima interaccion en CaseCommunication
                last_comm = db.query(models.CaseCommunication).join(
                    models.Pqrsf, models.CaseCommunication.pqrsf_id == models.Pqrsf.id
                ).filter(
                    models.Pqrsf.customer_id == cust.id
                ).order_by(models.CaseCommunication.fecha.desc()).first()
                
                # Si no hay comunicaciones, usar la ultima PQRSF
                if not last_comm:
                    last_pqrsf = db.query(models.Pqrsf).filter(models.Pqrsf.customer_id == cust.id).order_by(models.Pqrsf.fecha_creacion.desc()).first()
                    if last_pqrsf and last_pqrsf.fecha_creacion < threshold_date:
                        provider.send("Sistema", "CustomerInactiveDetected", f"El cliente {cust.name} lleva inactivo más de 90 días.")
                else:
                    if last_comm.fecha < threshold_date:
                        provider.send("Sistema", "CustomerInactiveDetected", f"El cliente {cust.name} lleva inactivo más de 90 días.")
                        
        except Exception as e:
            logger.error(f"Error in relationship monitor task: {e}")
        finally:
            if 'db' in locals():
                db.close()
                
        # Wait for 24 hours (86400 seconds)
        await asyncio.sleep(86400)
