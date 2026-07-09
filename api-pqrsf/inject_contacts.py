import os

file_path = "/app/main.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Inject log_audit helper after imports
if "def log_audit" not in content:
    helper_code = """
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

"""
    content = content.replace("app = FastAPI(", helper_code + "app = FastAPI(")

# 2. Replace create_contact and append new endpoints
old_create_contact = """@app.post("/contacts", response_model=schemas.ContactResponse)
def create_contact(contact: schemas.ContactCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_contact = models.Contact(**contact.model_dump())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact"""

new_endpoints = """@app.post("/contacts", response_model=schemas.ContactResponse)
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
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    
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
        setattr(db_contact, key, value)
        
    db.commit()
    db.refresh(db_contact)
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
    
    db.commit()
    db.refresh(db_contact)
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
    
    db.commit()
    db.refresh(db_contact)
    log_audit(db, "ContactReactivated", "Contact", db_contact.id, current_user.id, db_contact.customer_id)
    return db_contact
"""

if old_create_contact in content:
    content = content.replace(old_create_contact, new_endpoints)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Injected endpoints successfully.")
else:
    print("Could not find old_create_contact snippet.")
