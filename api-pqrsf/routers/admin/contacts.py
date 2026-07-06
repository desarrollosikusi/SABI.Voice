from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, auth
from database import get_db
from notifications.provider import get_notification_provider

router = APIRouter()

@router.get("/", response_model=List[schemas.ContactResponse])
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Contact).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.ContactResponse)
def create(item: schemas.ContactCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_item = models.Contact(**item.model_dump())
    if item.password_hash:
        from auth import get_password_hash
        db_item.password_hash = get_password_hash(item.password_hash)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    provider = get_notification_provider()
    provider.send("Sistema", "ContactCreated", f"Nuevo contacto registrado: {db_item.name} ({db_item.email})")
    
    return db_item

@router.put("/{item_id}", response_model=schemas.ContactResponse)
def update(item_id: int, item: schemas.ContactCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_item = db.query(models.Contact).filter(models.Contact.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Contact not found")
        
    data = item.model_dump(exclude_unset=True)
    if "password_hash" in data and data["password_hash"]:
        from auth import get_password_hash
        data["password_hash"] = get_password_hash(data["password_hash"])
        
    for key, value in data.items():
        setattr(db_item, key, value)
        
    db.commit()
    db.refresh(db_item)
    
    provider = get_notification_provider()
    provider.send("Sistema", "ContactUpdated", f"Contacto actualizado: {db_item.name} ({db_item.email})")
    
    return db_item
