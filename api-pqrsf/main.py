import os
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Query, Request
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, String, cast
from typing import List, Optional
import datetime
import requests
import uuid

import models
import schemas
import crud
import auth
from database import engine, get_db, Base
from business_rules.engine import engine as rules_engine


def log_audit(db: Session, action: str, entity_type: str, entity_id: int, user_id: int, customer_id: int = None, details: dict = None):
    audit = models.AuditLog(
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        customer_id=customer_id,
        user_id=user_id,
        details=details
    )
    db.add(audit)
    db.commit()

app = FastAPI(title="SABI Voice API", version="1.0.0")

# Create static directory if it doesn't exist
os.makedirs("static/logos", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Global Exception Handler to sanitize logs
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Error procesando petición en {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Ha ocurrido un error interno en el servidor."},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import asyncio
from sla.engine import sla_monitor_task
from relationship_monitor import customer_relationship_monitor_task
from security.file_validator import is_allowed_file
from security.file_scanner import get_file_scanner
from notifications.provider import get_notification_provider
from fastapi.responses import JSONResponse, FileResponse
import traceback
import re

def secure_filename(filename: str) -> str:
    # Basic implementation of secure_filename without werkzeug
    filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)
    filename = filename.strip('._')
    return filename or 'unnamed_file'

@app.on_event("startup")
def on_startup():
    db = next(get_db())
    admin = crud.get_user_by_username(db, "admin")
    if not admin:
        default_pwd = os.getenv("ADMIN_PASSWORD", "admin123")
        crud.create_user(db, schemas.UserCreate(
            name="Administrador del Sistema",
            email="admin@sabi-voice.com",
            username="admin", 
            password=default_pwd, 
            role="Administrador"
        ))
        
    asyncio.create_task(sla_monitor_task())
    asyncio.create_task(customer_relationship_monitor_task())

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Email notification test triggered"}

@app.get("/dashboard/customer-relationship")
def get_customer_relationship_dashboard(db: Session = Depends(get_db)):
    from datetime import datetime, timedelta
    from sqlalchemy import func
    
    today = datetime.utcnow().date()
    
    # 1. Cumpleaños de hoy
    cumples_hoy = db.query(models.Contact).filter(
        func.extract('month', models.Contact.fecha_nacimiento) == today.month,
        func.extract('day', models.Contact.fecha_nacimiento) == today.day,
        models.Contact.is_active == True
    ).all()
    
    # 2. Próximos cumpleaños (próximos 7 días)
    all_contacts = db.query(models.Contact).filter(models.Contact.fecha_nacimiento != None, models.Contact.is_active == True).all()
    proximos_cumples = []
    for c in all_contacts:
        if not c.fecha_nacimiento: continue
        try:
            bday_this_year = c.fecha_nacimiento.replace(year=today.year)
        except ValueError:
            bday_this_year = c.fecha_nacimiento.replace(year=today.year, day=28)
        
        diff = (bday_this_year - today).days
        if 0 < diff <= 7:
            proximos_cumples.append(c)
            
    # 3. Aniversarios del mes
    aniversarios_mes = db.query(models.Customer).filter(
        func.extract('month', models.Customer.fecha_alta_comercial) == today.month,
        models.Customer.is_active == True
    ).all()
    
    # 4. Clientes nuevos este mes (assuming there is no fecha_creacion, I'll skip it or mock it)
    # the schema doesn't have fecha_creacion on Customer. I will return empty array to prevent crash.
    clientes_nuevos = []
    
    # 5. Clientes sin interacción en 90 días
    threshold_date = datetime.utcnow() - timedelta(days=90)
    inactivos = []
    active_customers = db.query(models.Customer).filter(models.Customer.is_active == True).all()
    for cust in active_customers:
        last_comm = db.query(models.CaseCommunication).join(
            models.Pqrsf, models.CaseCommunication.pqrsf_id == models.Pqrsf.id
        ).filter(models.Pqrsf.customer_id == cust.id).order_by(models.CaseCommunication.fecha.desc()).first()
        
        if not last_comm:
            last_pqrsf = db.query(models.Pqrsf).filter(models.Pqrsf.customer_id == cust.id).order_by(models.Pqrsf.fecha_creacion.desc()).first()
            if not last_pqrsf or last_pqrsf.fecha_creacion < threshold_date:
                inactivos.append({"cliente": cust.name, "dias_inactivo": 90 if not last_pqrsf else (datetime.utcnow() - last_pqrsf.fecha_creacion).days})
        else:
            if last_comm.fecha < threshold_date:
                inactivos.append({"cliente": cust.name, "dias_inactivo": (datetime.utcnow() - last_comm.fecha).days})
                
    return {
        "cumpleanos_hoy": [{"id": c.id, "nombre": f"{c.name} {c.apellidos or ''}".strip(), "cliente": c.customer.name if c.customer else "Sin Empresa"} for c in cumples_hoy],
        "proximos_cumpleanos": [{"id": c.id, "nombre": f"{c.name} {c.apellidos or ''}".strip(), "fecha": c.fecha_nacimiento.strftime("%Y-%m-%d"), "cliente": c.customer.name if c.customer else "Sin Empresa"} for c in proximos_cumples],
        "aniversarios_mes": [{"id": c.id, "nombre": c.name, "anios": today.year - c.fecha_alta_comercial.year} for c in aniversarios_mes if c.fecha_alta_comercial],
        "clientes_nuevos": clientes_nuevos,
        "inactivos": inactivos
    }

@app.post("/auth/login", response_model=schemas.Token)
def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db),
    _: bool = Depends(auth.check_rate_limit)
):
    provider = get_notification_provider()
    # Try user first
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if user and auth.verify_password(form_data.password, user.password_hash):
        if not user.is_active:
            provider.send("Seguridad", "LoginFailed", f"Usuario inactivo intentó acceder: {form_data.username}")
            raise HTTPException(status_code=400, detail="Inactive user")
        
        token_data = {
            "sub": user.username,
            "user_type": "internal",
            "user_id": user.id,
            "roles": [user.role],
            "area": user.area.name if user.area else None
        }
        access_token = auth.create_access_token(data=token_data)
        provider.send("Seguridad", "InternalLogin", f"Usuario interno {user.username} inició sesión")
        return {"access_token": access_token, "token_type": "bearer"}
        
    # Try contact (customer)
    contact = db.query(models.Contact).filter(models.Contact.email == form_data.username).first()
    if contact and contact.password_hash and auth.verify_password(form_data.password, contact.password_hash):
        if not contact.is_active or not contact.authorized_for_pqrsf:
            provider.send("Seguridad", "CustomerLoginFailed", f"Contacto inactivo o no autorizado intentó acceder: {form_data.username}")
            raise HTTPException(status_code=400, detail="Inactive or unauthorized contact")
            
        token_data = {
            "sub": contact.email,
            "user_type": "customer",
            "contact_id": contact.id,
            "customer_id": contact.customer_id,
            "roles": ["customer"]
        }
        access_token = auth.create_access_token(data=token_data)
        provider.send("Seguridad", "CustomerLogin", f"Contacto {contact.email} inició sesión en el Portal del Cliente")
        return {"access_token": access_token, "token_type": "bearer"}

    provider.send("Seguridad", "CustomerLoginFailed", f"Intento fallido de login para: {form_data.username}")
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username/email or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.get("/portal/me", response_model=schemas.ContactResponse)
def read_portal_me(current_customer: models.Contact = Depends(auth.get_current_customer)):
    return current_customer

@app.put("/portal/me", response_model=schemas.ContactResponse)
def update_portal_me(update_data: schemas.ContactUpdate, db: Session = Depends(get_db), current_customer: models.Contact = Depends(auth.get_current_customer)):
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(current_customer, key, value)
    db.commit()
    db.refresh(current_customer)
    return current_customer

# ================================
# CATÁLOGOS (PÚBLICOS Y PRIVADOS)
# ================================
from routers.admin import router as admin_router
app.include_router(admin_router, prefix="/admin")

@app.get("/catalogs/economic-sectors", response_model=List[schemas.EconomicSectorResponse])
def get_economic_sectors(db: Session = Depends(get_db)):
    return db.query(models.EconomicSector).filter(models.EconomicSector.is_active == True).order_by(models.EconomicSector.order_index).all()

@app.get("/catalogs/internal-users", response_model=List[schemas.UserResponse])
def get_internal_users(db: Session = Depends(get_db)):
    # Returns internal active users for dropdowns
    return db.query(models.User).filter(models.User.is_active == True).all()

@app.put("/admin/customers/{customer_id}", response_model=schemas.CustomerResponse)
def update_customer_admin(
    customer_id: int, 
    customer_update: schemas.CustomerUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    # Role-based authorization
    allowed_roles = ["admin", "Operaciones", "Coordinador"]
    if current_user.role not in allowed_roles:
        raise HTTPException(status_code=403, detail="No tienes permisos para editar clientes.")
    
    db_customer = crud.get_customer_by_id(db, customer_id)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    provider = get_notification_provider()
    
    # Track changes
    old_sector = db_customer.economic_sector_id
    old_pm = db_customer.pm_id
    old_sdm = db_customer.sdm_id
    old_am = db_customer.ejecutivo_cuenta_id
    
    update_data = customer_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_customer, key, value)
        
    db.commit()
    db.refresh(db_customer)
    
    # Audit events
    provider.send("Auditoría", "CustomerUpdated", f"El cliente {db_customer.name} fue actualizado por {current_user.username}")
    
    if "economic_sector_id" in update_data and old_sector != db_customer.economic_sector_id:
        provider.send("Auditoría", "CustomerSectorChanged", f"Sector del cliente {db_customer.name} actualizado.")
        
    if "pm_id" in update_data and old_pm != db_customer.pm_id:
        provider.send("Auditoría", "CustomerResponsibleChanged", f"PM del cliente {db_customer.name} actualizado.")
        
    if "sdm_id" in update_data and old_sdm != db_customer.sdm_id:
        provider.send("Auditoría", "CustomerResponsibleChanged", f"SDM del cliente {db_customer.name} actualizado.")
        
    if "ejecutivo_cuenta_id" in update_data and old_am != db_customer.ejecutivo_cuenta_id:
        provider.send("Auditoría", "CustomerResponsibleChanged", f"AM del cliente {db_customer.name} actualizado.")
        
    return db_customer

@app.post("/admin/customers/{customer_id}/logo")
def upload_customer_logo(
    customer_id: int, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    allowed_roles = ["admin", "Operaciones", "Coordinador"]
    if current_user.role not in allowed_roles:
        raise HTTPException(status_code=403, detail="No tienes permisos para editar clientes.")
        
    if file.content_type not in ["image/jpeg", "image/png", "image/svg+xml"]:
        raise HTTPException(status_code=400, detail="Formato no permitido")
        
    content = file.file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="El logo no puede exceder 5MB")
        
    file.file.seek(0)
    
    db_customer = crud.get_customer_by_id(db, customer_id)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    import uuid
    import os
    from datetime import datetime
    
    ext = file.filename.split('.')[-1]
    safe_filename = f"{uuid.uuid4().hex}.{ext}"
    upload_dir = "static/logos"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, safe_filename)
    
    with open(file_path, "wb") as f:
        f.write(content)
        
    db_customer.logo_path = file_path
    db_customer.logo_filename = file.filename
    db_customer.logo_content_type = file.content_type
    db_customer.logo_updated_at = datetime.utcnow()
    
    db.commit()
    
    provider = get_notification_provider()
    provider.send("Auditoría", "CustomerLogoUpdated", f"Logo del cliente {db_customer.name} actualizado por {current_user.username}")
    
    return {"message": "Logo actualizado exitosamente", "logo_path": file_path}

@app.get("/catalogs/customers", response_model=List[schemas.CustomerResponse])
def search_customers(search: str = Query(None, min_length=3), db: Session = Depends(get_db)):
    if not search:
        return []
    return crud.search_customers(db, search, limit=10)

@app.get("/customers/{customer_id}/contacts", response_model=List[schemas.ContactResponse])
def get_customer_contacts(customer_id: int, db: Session = Depends(get_db)):
    return crud.get_contacts_by_customer(db, customer_id)

@app.get("/customers/check-nit/{nit}")
def check_nit(nit: str, document_type: str = "NIT", db: Session = Depends(get_db)):
    if document_type == "NIT":
        clean_nit = re.sub(r'\D', '', nit)
    else:
        clean_nit = re.sub(r'[^a-zA-Z0-9]', '', nit).upper()
    exists = db.query(models.Customer).filter(models.Customer.nit == clean_nit).first() is not None
    return {"exists": exists}

@app.post("/customers", response_model=schemas.CustomerResponse)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    duplicated_nit = False
    if customer.nit:
        existing_customer = db.query(models.Customer).filter(models.Customer.nit == customer.nit).first()
        if existing_customer:
            if customer.economic_sector_id != 4:
                raise HTTPException(status_code=400, detail="El NIT ya se encuentra registrado.")
            duplicated_nit = True

    db_customer = models.Customer(**customer.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    
    if duplicated_nit:
        log_audit(
            db, 
            action="CustomerCreatedWithDuplicateNIT", 
            entity_type="Customer", 
            entity_id=db_customer.id, 
            user_id=current_user.id, 
            customer_id=db_customer.id,
            details={"nit": customer.nit, "motivo": "Registro permitido por regla de Sector Público Territorial"}
        )
        
    return db_customer

@app.post("/contacts", response_model=schemas.ContactResponse)
def create_contact(contact: schemas.ContactCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Validate email
    existing_email = db.query(models.Contact).filter(models.Contact.customer_id == contact.customer_id, models.Contact.email == contact.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="El correo ya se encuentra registrado para este cliente.")
    
    # Validate principal
    if contact.es_principal:
        existing_principal = db.query(models.Contact).filter(models.Contact.customer_id == contact.customer_id, models.Contact.es_principal == True, models.Contact.is_active == True).first()
        if existing_principal:
            raise HTTPException(status_code=400, detail="Ya existe un contacto principal activo para este cliente.")

    db_contact = models.Contact(**contact.model_dump())
    db_contact.functional_id = f"STK-{uuid.uuid4().hex[:8].upper()}"
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    
    history_entry = models.ContactHistory(
        contact_id=db_contact.id,
        user_id=current_user.id,
        field_name="creation",
        old_value=None,
        new_value="Created",
        changed_at=datetime.datetime.utcnow()
    )
    db.add(history_entry)
    db.commit()

    provider = get_notification_provider()
    provider.send("Sistema", "ContactCreated", f"Nuevo contacto registrado: {db_contact.name} ({db_contact.email})")

    log_audit(db, "ContactCreated", "Contact", db_contact.id, current_user.id, db_contact.customer_id)
    return db_contact

@app.put("/contacts/{contact_id}", response_model=schemas.ContactResponse)
def update_contact(contact_id: int, contact: schemas.ContactUpdateAdmin, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
    if not db_contact:
        raise HTTPException(status_code=404, detail="Contacto no encontrado")
    
    update_data = contact.model_dump(exclude_unset=True)
    
    if "email" in update_data and update_data["email"] != db_contact.email:
        existing_email = db.query(models.Contact).filter(models.Contact.customer_id == db_contact.customer_id, models.Contact.email == update_data["email"]).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="El correo ya se encuentra registrado para este cliente.")
            
    if update_data.get("es_principal"):
        existing_principal = db.query(models.Contact).filter(models.Contact.customer_id == db_contact.customer_id, models.Contact.es_principal == True, models.Contact.is_active == True, models.Contact.id != contact_id).first()
        if existing_principal:
            raise HTTPException(status_code=400, detail="Ya existe un contacto principal activo para este cliente.")

    for key, value in update_data.items():
        old_val = getattr(db_contact, key)
        if old_val != value:
            setattr(db_contact, key, value)
            history_entry = models.ContactHistory(
                contact_id=db_contact.id,
                user_id=current_user.id,
                field_name=key,
                old_value=str(old_val) if old_val is not None else None,
                new_value=str(value) if value is not None else None,
                changed_at=datetime.datetime.utcnow()
            )
            db.add(history_entry)
        
    db.commit()
    db.refresh(db_contact)
    
    provider = get_notification_provider()
    provider.send("Sistema", "ContactUpdated", f"Contacto actualizado: {db_contact.name} ({db_contact.email})")
    
    log_audit(db, "ContactUpdated", "Contact", db_contact.id, current_user.id, db_contact.customer_id, details=update_data)
    return db_contact

@app.patch("/contacts/{contact_id}/deactivate", response_model=schemas.ContactResponse)
def deactivate_contact(contact_id: int, data: schemas.ContactDeactivate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
    if not db_contact:
        raise HTTPException(status_code=404, detail="Contacto no encontrado")
        
    db_contact.is_active = False
    db_contact.deactivation_reporter = data.deactivation_reporter
    db_contact.deactivation_support = data.deactivation_support
    db_contact.deactivation_date = datetime.datetime.utcnow()
    
    history_entry = models.ContactHistory(
        contact_id=db_contact.id,
        user_id=current_user.id,
        field_name="status",
        old_value="Active",
        new_value="Inactive",
        changed_at=datetime.datetime.utcnow()
    )
    db.add(history_entry)
    
    db.commit()
    db.refresh(db_contact)
    
    provider = get_notification_provider()
    provider.send("Sistema", "ContactDeactivated", f"Contacto inactivado: {db_contact.name} ({db_contact.email})")
    
    log_audit(db, "ContactDeactivated", "Contact", db_contact.id, current_user.id, db_contact.customer_id, details=data.model_dump())
    return db_contact

@app.patch("/contacts/{contact_id}/reactivate", response_model=schemas.ContactResponse)
def reactivate_contact(contact_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
    if not db_contact:
        raise HTTPException(status_code=404, detail="Contacto no encontrado")
        
    if db_contact.es_principal:
        existing_principal = db.query(models.Contact).filter(models.Contact.customer_id == db_contact.customer_id, models.Contact.es_principal == True, models.Contact.is_active == True, models.Contact.id != contact_id).first()
        if existing_principal:
            raise HTTPException(status_code=400, detail="Ya existe un contacto principal activo para este cliente. Retire el rol principal al otro contacto antes de reactivar.")

    db_contact.is_active = True
    db_contact.deactivation_reporter = None
    db_contact.deactivation_support = None
    db_contact.deactivation_date = None
    
    history_entry = models.ContactHistory(
        contact_id=db_contact.id,
        user_id=current_user.id,
        field_name="status",
        old_value="Inactive",
        new_value="Active",
        changed_at=datetime.datetime.utcnow()
    )
    db.add(history_entry)
    
    db.commit()
    db.refresh(db_contact)
    
    provider = get_notification_provider()
    provider.send("Sistema", "ContactReactivated", f"Contacto reactivado: {db_contact.name} ({db_contact.email})")
    
    log_audit(db, "ContactReactivated", "Contact", db_contact.id, current_user.id, db_contact.customer_id)
    return db_contact

@app.get("/contacts/{contact_id}/history", response_model=List[schemas.ContactHistoryResponse])
def get_contact_history(contact_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.ContactHistory).filter(models.ContactHistory.contact_id == contact_id).order_by(models.ContactHistory.changed_at.desc()).all()


# ================================
# PQRSF
# ================================

class ClassifyRequestProxy(schemas.BaseModel):
    asunto: str
    descripcion: str

@app.post("/pqrsf/classify")
def classify_pqrsf(req: ClassifyRequestProxy, db: Session = Depends(get_db)):
    ia_url = os.getenv("IA_URL", "http://ia-classifier:8001")
    try:
        resp = requests.post(f"{ia_url}/classify", json={"subject": req.asunto, "body": req.descripcion})
        if resp.status_code == 200:
            ai_data = resp.json()
            rules_result = rules_engine.evaluate(db=db, subject=req.asunto, text=req.descripcion, ai_classification=ai_data)
            final_data = rules_result["clasificacion_final"]
            
            # Map strings to IDs using the database catalogs
            mapped_data = {
                "resumen": final_data.get("resumen"),
                "riesgo": final_data.get("riesgo"),
                "impacto": final_data.get("impacto"),
                "accion_recomendada": final_data.get("accion_recomendada") or final_data.get("recomendacion")
            }
            
            def get_id(model_cls, name_val):
                if not name_val: return None
                rec = db.query(model_cls).filter(model_cls.name.ilike(name_val)).first()
                return rec.id if rec else None

            mapped_data["tipo_id"] = get_id(models.PqrsfType, final_data.get("tipo"))
            mapped_data["area_id"] = get_id(models.Area, final_data.get("area"))
            mapped_data["area_responsable_id"] = get_id(models.Area, final_data.get("area_responsable"))
            mapped_data["prioridad_id"] = get_id(models.Priority, final_data.get("prioridad"))
            mapped_data["arquitectura_id"] = get_id(models.Architecture, final_data.get("arquitectura"))
            mapped_data["sentimiento_id"] = get_id(models.Sentiment, final_data.get("sentimiento"))
            mapped_data["causa_probable_id"] = get_id(models.ProbableCause, final_data.get("causa_probable"))
            
            return {
                **mapped_data,
                "clasificacion_ia": ai_data,
                "clasificacion_final": final_data,
                "modificada": rules_result["modificada"],
                "reglas_aplicadas": rules_result["reglas_aplicadas"]
            }
        return {"error": "IA unavailable"}
    except Exception as e:
        return {"error": str(e)}

@app.post("/pqrsf", response_model=schemas.PqrsfResponse)
def create_pqrsf(pqrsf: schemas.PqrsfCreate, db: Session = Depends(get_db)):
    # The client can pass clasificacion_final directly. 
    # The engine should suggest area_responsable.
    if not pqrsf.area_responsable_id and pqrsf.clasificacion_final and "area_responsable_id" in pqrsf.clasificacion_final:
        pqrsf.area_responsable_id = pqrsf.clasificacion_final["area_responsable_id"]
        
    return crud.create_pqrsf(db=db, pqrsf=pqrsf)

@app.get("/pqrsf", response_model=List[schemas.PqrsfResponse])
def get_pqrsfs(skip: int = 0, limit: int = 100, area_id: Optional[int] = None, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Omitimos area public parameter y enrutamos por el area del current user si se envía 'my_area' flag o similar
    # Pero para simplificar, usaremos el query param `area_id`. 
    # El Frontend enviará `area_id=user.area_id` para ver su bandeja, o nada para todos (si es admin).
    return crud.get_pqrsf(db, skip=skip, limit=limit, area_id=area_id)

@app.get("/pqrsf/{pqrsf_id}", response_model=schemas.PqrsfResponse)
def get_pqrsf(pqrsf_id: int, db: Session = Depends(get_db)):
    db_pqrsf = crud.get_pqrsf_by_id(db, pqrsf_id)
    if not db_pqrsf:
        raise HTTPException(status_code=404, detail="PQRSF not found")
    return db_pqrsf

@app.put("/pqrsf/{pqrsf_id}", response_model=schemas.PqrsfResponse)
def update_pqrsf(pqrsf_id: int, pqrsf: schemas.PqrsfUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    try:
        updated = crud.update_pqrsf(db, pqrsf_id, pqrsf, current_user.id)
        if not updated:
            raise HTTPException(status_code=404, detail="PQRSF not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/portal/pqrsf/mine", response_model=List[schemas.PqrsfResponse])
def get_customer_pqrsfs(db: Session = Depends(get_db), current_customer: models.Contact = Depends(auth.get_current_customer)):
    return crud.get_customer_pqrsfs(db, current_customer.customer_id)

@app.get("/portal/dashboard", response_model=schemas.CustomerDashboardResponse)
def get_customer_dashboard(db: Session = Depends(get_db), current_customer: models.Contact = Depends(auth.get_current_customer)):
    return crud.get_customer_dashboard_stats(db, current_customer.customer_id, current_customer.id)


@app.get("/pqrsf/{pqrsf_id}/communications", response_model=List[schemas.CaseCommunicationResponse])
def get_pqrsf_communications(pqrsf_id: int, db: Session = Depends(get_db), token_payload: dict = Depends(auth.get_token_payload)):
    # Validate user access
    user_type = token_payload.get("user_type")
    
    if user_type == "customer":
        contact_id = token_payload.get("contact_id")
        contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
        if not contact or not contact.is_active:
            raise HTTPException(status_code=403, detail="Unauthorized")
            
        pqrsf = crud.get_pqrsf_by_id(db, pqrsf_id)
        if not pqrsf or pqrsf.customer_id != contact.customer_id:
            raise HTTPException(status_code=403, detail="Forbidden: PQRSF belongs to another customer")
            
        return crud.get_case_communications(db, pqrsf_id, include_internal=False)
        
    elif user_type == "internal":
        return crud.get_case_communications(db, pqrsf_id, include_internal=True)
        
    raise HTTPException(status_code=401, detail="Invalid token type")

@app.post("/pqrsf/{pqrsf_id}/communications", response_model=schemas.CaseCommunicationResponse)
def create_pqrsf_communication(pqrsf_id: int, comm_data: schemas.CaseCommunicationCreate, db: Session = Depends(get_db), token_payload: dict = Depends(auth.get_token_payload)):
    user_type = token_payload.get("user_type")
    
    pqrsf = crud.get_pqrsf_by_id(db, pqrsf_id)
    if not pqrsf:
        raise HTTPException(status_code=404, detail="PQRSF not found")

    autor_usuario_id = None
    autor_contacto_id = None

    if user_type == "customer":
        contact_id = token_payload.get("contact_id")
        contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
        if not contact or not contact.is_active or pqrsf.customer_id != contact.customer_id:
            raise HTTPException(status_code=403, detail="Forbidden")
        autor_contacto_id = contact.id
        # Force these values for customer to prevent spoofing
        comm_data.tipo = "Cliente"
        comm_data.direccion = "Entrante"
        comm_data.canal = "Portal"

    elif user_type == "internal":
        user_id = token_payload.get("user_id")
        autor_usuario_id = user_id
    else:
        raise HTTPException(status_code=401, detail="Invalid token type")

    try:
        comm = crud.create_case_communication(db, pqrsf_id, comm_data, autor_usuario_id, autor_contacto_id)
        return comm
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/pqrsf/{pqrsf_id}/comments", response_model=schemas.PqrsfCommentResponse)
def add_pqrsf_comment(pqrsf_id: int, comment: schemas.PqrsfCommentBase, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_pqrsf = crud.get_pqrsf_by_id(db, pqrsf_id)
    if not db_pqrsf:
        raise HTTPException(status_code=404, detail="PQRSF not found")
    return crud.create_comment(db, pqrsf_id, current_user.id, comment.comentario)

class FindingUpdateStatus(schemas.BaseModel):
    estado: str

@app.put("/pqrsf/{pqrsf_id}/findings/{finding_id}", response_model=schemas.OrganizationalFindingResponse)
def update_finding_status(pqrsf_id: int, finding_id: int, status_update: FindingUpdateStatus, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_finding = db.query(models.OrganizationalFinding).filter(
        models.OrganizationalFinding.id == finding_id,
        models.OrganizationalFinding.pqrsf_id == pqrsf_id
    ).first()
    
    if not db_finding:
        raise HTTPException(status_code=404, detail="Finding not found")
        
    db_finding.estado = status_update.estado
    db_finding.validado_por_id = current_user.id
    db_finding.fecha_validacion = datetime.datetime.utcnow()
    
    crud.add_history(db, pqrsf_id, "Validación de Hallazgo", f"Hallazgo {finding_id} actualizado a {status_update.estado}", current_user.id)
    
    db.commit()
    db.refresh(db_finding)
    return db_finding

@app.post("/pqrsf/{pqrsf_id}/attachments")
def upload_attachment(pqrsf_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_pqrsf = crud.get_pqrsf_by_id(db, pqrsf_id)
    if not db_pqrsf:
        raise HTTPException(status_code=404, detail="PQRSF not found")
        
    MAX_SIZE = 5 * 1024 * 1024 # 5 MB
    
    header_bytes = file.file.read(2048)
    file.file.seek(0)
    
    if not is_allowed_file(file.filename, file.content_type, header_bytes):
        get_notification_provider().send("Seguridad", "SecurityAlert", f"Intento de subida de archivo no permitido: {file.filename}")
        raise HTTPException(status_code=400, detail="Formato de archivo inválido o contenido malicioso detectado.")
        
    os.makedirs("attachments", exist_ok=True)
    safe_filename = secure_filename(file.filename)
    file_path = f"attachments/{pqrsf_id}_{safe_filename}"
    
    size = 0
    with open(file_path, "wb") as buffer:
        while chunk := file.file.read(8192):
            size += len(chunk)
            if size > MAX_SIZE:
                buffer.close()
                os.remove(file_path)
                raise HTTPException(status_code=413, detail="El archivo excede el tamaño máximo permitido de 5MB")
            buffer.write(chunk)
            
    # Antivirus Hook
    scanner = get_file_scanner()
    if not scanner.scan_file(file_path):
        os.remove(file_path)
        get_notification_provider().send("Seguridad", "SecurityAlert", f"Archivo malicioso detectado por AV: {safe_filename}")
        raise HTTPException(status_code=400, detail="Archivo infectado detectado.")
        
    db_attachment = models.PqrsfAttachment(
        pqrsf_id=pqrsf_id,
        file_name=safe_filename,
        file_path=file_path,
        content_type=file.content_type,
        size=size
    )
    db.add(db_attachment)
    db.commit()
    
    # Auditoría
    get_notification_provider().send("Auditoría", "FileUploaded", f"Archivo subido: {safe_filename} al caso {pqrsf_id} por {current_user.username}")
    return {"message": "Attachment uploaded successfully"}


from fastapi.responses import FileResponse

@app.get("/api/files/customer-logo/{customer_id}")
def get_customer_logo(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer or not customer.logo_path:
        raise HTTPException(status_code=404, detail="Logo not found")
        
    file_path = customer.logo_path.lstrip("/")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Logo file missing")
        
    return FileResponse(file_path)

@app.get("/pqrsf/{pqrsf_id}/attachments/{attachment_id}/download")
def download_attachment(
    pqrsf_id: int, 
    attachment_id: int, 
    db: Session = Depends(get_db), 
    token: dict = Depends(auth.get_token_payload)
):
    # Retrieve user or customer
    user_type = token.get("user_type")
    
    db_pqrsf = crud.get_pqrsf_by_id(db, pqrsf_id)
    if not db_pqrsf:
        raise HTTPException(status_code=404, detail="PQRSF not found")
        
    # Validate authorization to download
    if user_type == "customer":
        contact_id = token.get("contact_id")
        if not contact_id or db_pqrsf.contact_id != contact_id:
            raise HTTPException(status_code=403, detail="Not authorized to download this file")
    elif user_type != "internal":
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    attachment = db.query(models.PqrsfAttachment).filter(
        models.PqrsfAttachment.id == attachment_id,
        models.PqrsfAttachment.pqrsf_id == pqrsf_id
    ).first()
    
    if not attachment:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
        
    if not os.path.exists(attachment.file_path):
        raise HTTPException(status_code=404, detail="El archivo físico no existe")
        
    return FileResponse(
        path=attachment.file_path, 
        filename=attachment.file_name, 
        media_type=attachment.content_type
    )


# ================================
# KNOWLEDGE BASE
# ================================

@app.get("/knowledge", response_model=List[schemas.KnowledgeArticleResponse])
def get_knowledge_articles(
    query: Optional[str] = None, 
    area: Optional[str] = None, 
    arquitectura: Optional[str] = None, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    return crud.search_knowledge(db, query=query, area=area, arquitectura=arquitectura)


# ================================
# DASHBOARD
# ================================

@app.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total = db.query(models.Pqrsf).count()
    abiertos = db.query(models.Pqrsf).join(models.WorkflowState, models.Pqrsf.estado_id == models.WorkflowState.id).filter(~models.WorkflowState.name.in_(['Cerrado', 'Cancelado'])).count()
    cerrados = db.query(models.Pqrsf).join(models.WorkflowState, models.Pqrsf.estado_id == models.WorkflowState.id).filter(models.WorkflowState.name == 'Cerrado').count()
    
    now = datetime.datetime.utcnow()
    vencidos = db.query(models.Pqrsf).join(models.WorkflowState, models.Pqrsf.estado_id == models.WorkflowState.id).filter(
        ~models.WorkflowState.name.in_(['Cerrado', 'Cancelado']),
        models.Pqrsf.fecha_vencimiento < now
    ).count()
    
    closed_cases = db.query(models.Pqrsf).join(models.WorkflowState, models.Pqrsf.estado_id == models.WorkflowState.id).filter(models.WorkflowState.name == 'Cerrado').all()
    avg_hours = 0.0
    if closed_cases:
        total_seconds = sum((c.fecha_cierre - c.fecha_creacion).total_seconds() for c in closed_cases)
        avg_hours = (total_seconds / len(closed_cases)) / 3600.0

    date_30_days_ago = now - datetime.timedelta(days=30)
    date_60_days_ago = now - datetime.timedelta(days=60)
    casos_last_30 = db.query(models.Pqrsf).filter(models.Pqrsf.fecha_creacion >= date_30_days_ago).count()
    casos_prev_30 = db.query(models.Pqrsf).filter(models.Pqrsf.fecha_creacion >= date_60_days_ago, models.Pqrsf.fecha_creacion < date_30_days_ago).count()
    variacion = 0.0
    if casos_prev_30 > 0:
        variacion = ((casos_last_30 - casos_prev_30) / casos_prev_30) * 100.0
    elif casos_last_30 > 0:
        variacion = 100.0

    riesgos_activos = db.query(models.Pqrsf).join(
        models.WorkflowState, models.Pqrsf.estado_id == models.WorkflowState.id
    ).join(
        models.Priority, models.Pqrsf.prioridad_id == models.Priority.id
    ).filter(
        ~models.WorkflowState.name.in_(['Cerrado', 'Cancelado']),
        (models.Priority.name == 'Alta') | (models.Pqrsf.riesgo.ilike('%alto%'))
    ).count()

    por_tipo_q = db.query(models.PqrsfType.name, func.count(models.Pqrsf.id)).join(models.PqrsfType, models.Pqrsf.tipo_id == models.PqrsfType.id).group_by(models.PqrsfType.name).all()
    por_tipo = {t[0]: t[1] for t in por_tipo_q if t[0]}
    
    por_area_q = db.query(models.Area.name, func.count(models.Pqrsf.id)).join(models.Area, models.Pqrsf.area_responsable_id == models.Area.id).group_by(models.Area.name).all()
    por_area = {a[0]: a[1] for a in por_area_q if a[0]}
    
    por_arq_q = db.query(models.Architecture.name, func.count(models.Pqrsf.id)).join(models.Architecture, models.Pqrsf.arquitectura_id == models.Architecture.id).group_by(models.Architecture.name).all()
    por_arq = {a[0]: a[1] for a in por_arq_q if a[0]}

    mapa_calor_q = db.query(
        models.Area.name, models.Architecture.name, func.count(models.Pqrsf.id)
    ).join(
        models.Area, models.Pqrsf.area_responsable_id == models.Area.id
    ).join(
        models.Architecture, models.Pqrsf.arquitectura_id == models.Architecture.id
    ).group_by(models.Area.name, models.Architecture.name).all()
    mapa_calor = [{"area": m[0], "arquitectura": m[1], "cantidad": m[2]} for m in mapa_calor_q]

    total_ia_classifications = db.query(models.Pqrsf).filter(models.Pqrsf.clasificacion_ia != None).count()
    modified_classifications = db.query(models.Pqrsf).filter(models.Pqrsf.clasificacion_modificada == True).count()
    precision_porcentaje = 0.0
    if total_ia_classifications > 0:
        precision_porcentaje = ((total_ia_classifications - modified_classifications) / total_ia_classifications) * 100.0

    top_rules_q = db.query(
        models.BusinessRule.name, func.count(models.Pqrsf.id)
    ).join(models.BusinessRule, models.Pqrsf.regla_aplicada_id == models.BusinessRule.id).group_by(models.BusinessRule.name).order_by(func.count(models.Pqrsf.id).desc()).limit(5).all()

    ia_precision = {
        "total_clasificaciones": total_ia_classifications,
        "modificadas": modified_classifications,
        "porcentaje_exactitud": round(precision_porcentaje, 2),
        "top_reglas": [{"regla": r[0], "cantidad": r[1]} for r in top_rules_q]
    }

    return {
        "total_casos": total,
        "abiertos": abiertos,
        "cerrados": cerrados,
        "vencidos": vencidos,
        "tiempo_promedio_horas": round(avg_hours, 2),
        "variacion_porcentual_casos": round(variacion, 2),
        "riesgos_activos": riesgos_activos,
        "por_tipo": por_tipo,
        "por_area": por_area,
        "por_arquitectura": por_arq,
        "mapa_calor": mapa_calor,
        "ia_precision": ia_precision
    }

@app.get("/dashboard/executive-summary", response_model=schemas.ExecutiveSummary)
def get_executive_summary(db: Session = Depends(get_db)):
    stats = get_dashboard_stats(db)
    
    top_clientes_q = db.query(models.Customer.name, func.count(models.Pqrsf.id).label("total"))\
        .join(models.Pqrsf, models.Customer.id == models.Pqrsf.customer_id)\
        .group_by(models.Customer.name)\
        .order_by(func.count(models.Pqrsf.id).desc())\
        .limit(5).all()
        
    top_causas_q = db.query(models.ProbableCause.name, func.count(models.Pqrsf.id).label("total"))\
        .join(models.ProbableCause, models.Pqrsf.causa_probable_id == models.ProbableCause.id)\
        .group_by(models.ProbableCause.name)\
        .order_by(func.count(models.Pqrsf.id).desc())\
        .limit(5).all()

    # Clientes estratégicos afectados
    clientes_estrategicos = db.query(
        models.Customer.name, models.Customer.criticality, func.count(models.Pqrsf.id).label("total")
    ).join(
        models.Pqrsf, models.Customer.id == models.Pqrsf.customer_id
    ).join(
        models.WorkflowState, models.Pqrsf.estado_id == models.WorkflowState.id
    ).filter(
        ~models.WorkflowState.name.in_(['Cerrado', 'Cancelado']),
        models.Customer.criticality != 'Estándar'
    ).group_by(
        models.Customer.name, models.Customer.criticality
    ).order_by(func.count(models.Pqrsf.id).desc()).all()

    return {
        **stats,
        "top_clientes": [{"cliente": c[0], "total": c[1]} for c in top_clientes_q],
        "top_causas": [{"causa": c[0], "total": c[1]} for c in top_causas_q],
        "clientes_estrategicos_afectados": [{"cliente": c[0], "nivel": c[1], "casos_activos": c[2]} for c in clientes_estrategicos]
    }

@app.get("/dashboard/root-causes", response_model=schemas.RootCauseResponse)
def get_root_causes(db: Session = Depends(get_db)):
    top_q = db.query(
        models.ProbableCause.name, 
        func.count(models.Pqrsf.id).label("cantidad"),
        models.Pqrsf.accion_recomendada
    ).join(models.ProbableCause, models.Pqrsf.causa_probable_id == models.ProbableCause.id)\
     .group_by(models.ProbableCause.name, models.Pqrsf.accion_recomendada)\
     .order_by(func.count(models.Pqrsf.id).desc())\
     .limit(10).all()
     
    top_causes = [
        schemas.RootCauseItem(
            causa_probable=c[0],
            cantidad=c[1],
            accion_recomendada=c[2] or "Sin recomendación"
        ) for c in top_q
    ]
    
    trend_q = db.query(
        cast(func.extract('month', models.Pqrsf.fecha_creacion), String).label("mes"),
        models.Pqrsf.causa_probable,
        func.count(models.Pqrsf.id)
    ).filter(models.Pqrsf.causa_probable != None)\
     .group_by("mes", models.Pqrsf.causa_probable).all()
     
    trend = [{"mes": t[0], "causa": t[1], "cantidad": t[2]} for t in trend_q]
    
    by_arch_q = db.query(
        models.Pqrsf.arquitectura,
        models.Pqrsf.causa_probable,
        func.count(models.Pqrsf.id)
    ).filter(models.Pqrsf.causa_probable != None)\
     .group_by(models.Pqrsf.arquitectura, models.Pqrsf.causa_probable).all()
     
    by_arch = [{"arquitectura": a[0], "causa": a[1], "cantidad": a[2]} for a in by_arch_q]
    
    by_area_q = db.query(
        models.Pqrsf.area_responsable,
        models.Pqrsf.causa_probable,
        func.count(models.Pqrsf.id)
    ).filter(models.Pqrsf.causa_probable != None)\
     .group_by(models.Pqrsf.area_responsable, models.Pqrsf.causa_probable).all()
     
    by_area = [{"area": a[0], "causa": a[1], "cantidad": a[2]} for a in by_area_q]

    return {
        "top_causes": top_causes,
        "trend": trend,
        "by_architecture": by_arch,
        "by_area": by_area
    }

@app.get("/dashboard/executive-insights", response_model=schemas.ExecutiveInsight)
def get_executive_insights(db: Session = Depends(get_db)):
    root_causes = get_root_causes(db)
    
    ia_url = os.getenv("IA_URL", "http://ia-classifier:8001")
    try:
        resp = requests.post(f"{ia_url}/generate-insight", json=root_causes)
        if resp.status_code == 200:
            data = resp.json()
            return schemas.ExecutiveInsight(
                insights=data.get("insights", ["No se pudo generar insight."]),
                recomendaciones=data.get("recomendaciones", [])
            )
    except Exception as e:
        print(f"Error calling IA for insights: {e}")
        
    return schemas.ExecutiveInsight(insights=["No se pudo contactar al servicio de Inteligencia Artificial para generar el resumen."], recomendaciones=[])

# --- Portal Cliente Endpoints ---
@app.get("/portal/pqrsf/{pqrsf_id}", response_model=schemas.CustomerPqrsfDetailResponse)
def get_portal_pqrsf_detail(pqrsf_id: int, db: Session = Depends(get_db), current_customer=Depends(auth.get_current_customer)):
    detail = crud.get_customer_pqrsf_detail(db, pqrsf_id, current_customer.customer_id)
    if not detail:
        raise HTTPException(status_code=403, detail="No tienes acceso a este caso o no existe")
    return detail

@app.get("/portal/pqrsf/{pqrsf_id}/communications", response_model=List[schemas.CustomerCommunicationResponse])
def get_portal_pqrsf_communications(pqrsf_id: int, db: Session = Depends(get_db), current_customer=Depends(auth.get_current_customer)):
    return crud.get_customer_pqrsf_communications(db, pqrsf_id, current_customer.customer_id)

@app.post("/portal/pqrsf/{pqrsf_id}/communications", response_model=schemas.CustomerCommunicationResponse)
def create_portal_pqrsf_communication(
    pqrsf_id: int, 
    comm: schemas.CustomerCommunicationCreate, 
    db: Session = Depends(get_db), 
    current_customer=Depends(auth.get_current_customer)
):
    new_comm = crud.create_customer_communication(db, pqrsf_id, current_customer.customer_id, comm.mensaje)
    if not new_comm:
        raise HTTPException(status_code=403, detail="No tienes acceso a este caso o no existe")
        
    return {
        "id": new_comm.id,
        "fecha": new_comm.fecha,
        "remitente": "Cliente",
        "mensaje": new_comm.subject,
        "adjuntos": []
    }

@app.get("/api/files/customer-logo/{customer_id}")
def get_customer_logo(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer or not customer.logo_path:
        raise HTTPException(status_code=404, detail="Logo not found")
        
    if not os.path.exists(customer.logo_path):
        raise HTTPException(status_code=404, detail="Physical file missing")
        
    return FileResponse(
        path=customer.logo_path,
        filename=customer.logo_filename or "logo.png",
        media_type=customer.logo_content_type or "image/png"
    )
