from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas, auth
from database import get_db
from notifications.provider import get_notification_provider

router = APIRouter()

@router.get("/", response_model=List[schemas.CustomerResponse])
def get_all(
    skip: int = 0, 
    limit: int = 100,
    search: Optional[str] = None,
    sector: Optional[str] = None,
    pm_id: Optional[int] = None,
    sdm_id: Optional[int] = None,
    am_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Customer)
    
    if search:
        query = query.filter(models.Customer.name.ilike(f"%{search}%"))
    if sector:
        query = query.filter(models.Customer.sector == sector)
    if pm_id:
        query = query.filter(models.Customer.pm_id == pm_id)
    if sdm_id:
        query = query.filter(models.Customer.sdm_id == sdm_id)
    if am_id:
        query = query.filter(models.Customer.ejecutivo_cuenta_id == am_id)
        
    customers = query.offset(skip).limit(limit).all()
    
    for c in customers:
        c.total_contactos = len(c.contacts)
        c.pqrsf_abiertas = sum(1 for p in c.pqrsfs if p.estado and not p.estado.is_final and p.estado.name != 'Cancelado')
        if c.pqrsfs:
            latest = max(c.pqrsfs, key=lambda p: p.fecha_creacion)
            c.ultima_interaccion = latest.fecha_creacion
        else:
            c.ultima_interaccion = None
        
    return customers

@router.get("/sectors", response_model=List[str])
def get_sectors(db: Session = Depends(get_db)):
    sectors = db.query(models.Customer.sector).distinct().all()
    return [s[0] for s in sectors if s[0]]

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
        
    db_item.total_contactos = len(db_item.contacts)
    db_item.pqrsf_abiertas = sum(1 for p in db_item.pqrsfs if p.estado and not p.estado.is_final and p.estado.name != 'Cancelado')
    db_item.pqrsf_cerradas = sum(1 for p in db_item.pqrsfs if p.estado and (p.estado.is_final or p.estado.name == 'Cancelado'))
    
    if db_item.pqrsfs:
        latest = max(db_item.pqrsfs, key=lambda p: p.fecha_creacion)
        db_item.ultima_interaccion = latest.fecha_creacion
    else:
        db_item.ultima_interaccion = None
        
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
