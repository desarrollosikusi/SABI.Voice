from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, auth
from database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.ProcessResponse])
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Process).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.ProcessResponse)
def create(item: schemas.ProcessBase, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_item = models.Process(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/{item_id}", response_model=schemas.ProcessResponse)
def update(item_id: int, item: schemas.ProcessBase, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_item = db.query(models.Process).filter(models.Process.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Not found")
    for key, value in item.model_dump().items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
def delete(item_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_item = db.query(models.Process).filter(models.Process.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Not found")
    db_item.is_active = False
    db.commit()
    return {"message": "Deleted successfully (soft delete)"}
