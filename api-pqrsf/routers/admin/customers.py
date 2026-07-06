from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, auth
from database import get_db
from notifications.provider import get_notification_provider

router = APIRouter()

@router.get("/", response_model=List[schemas.CustomerResponse])
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Customer).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.CustomerResponse)
def create(item: schemas.CustomerCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_item = models.Customer(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    provider = get_notification_provider()
    provider.send("Sistema", "CustomerCreated", f"Nuevo cliente registrado: {db_item.name}")
    
    return db_item

@router.get("/{item_id}", response_model=schemas.CustomerResponse)
def get_one(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.Customer).filter(models.Customer.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_item

@router.put("/{item_id}", response_model=schemas.CustomerResponse)
def update(item_id: int, item: schemas.CustomerCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_item = db.query(models.Customer).filter(models.Customer.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    for key, value in item.model_dump(exclude_unset=True).items():
        setattr(db_item, key, value)
        
    db.commit()
    db.refresh(db_item)
    
    provider = get_notification_provider()
    provider.send("Sistema", "CustomerUpdated", f"Cliente actualizado: {db_item.name}")
    
    return db_item
