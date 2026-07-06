import os

models_map = {
    "areas": ("Area", "CatalogResponse", "CatalogBase", "Area"),
    "architectures": ("Architecture", "CatalogResponse", "CatalogBase", "Architecture"),
    "types": ("PqrsfType", "CatalogResponse", "CatalogBase", "Type"),
    "priorities": ("Priority", "PriorityResponse", "PriorityBase", "Priority"),
    "causes": ("ProbableCause", "CatalogResponse", "CatalogBase", "Cause"),
    "categories": ("CauseCategory", "CatalogResponse", "CatalogBase", "Category"),
    "sentiments": ("Sentiment", "CatalogResponse", "CatalogBase", "Sentiment"),
    "states": ("WorkflowState", "WorkflowStateResponse", "CatalogBase", "State") # We might need a full schema for state, but fallback to CatalogBase for create
}

template = """from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, auth
from database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.{schema_resp}])
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.{model}).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.{schema_resp})
def create(item: schemas.{schema_base}, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_item = models.{model}(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/{{item_id}}", response_model=schemas.{schema_resp})
def update(item_id: int, item: schemas.{schema_base}, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_item = db.query(models.{model}).filter(models.{model}.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="{name} not found")
    for key, value in item.model_dump().items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{{item_id}}")
def delete(item_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_item = db.query(models.{model}).filter(models.{model}.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="{name} not found")
    db_item.is_active = False # Soft delete
    db.commit()
    return {{"message": "Deleted successfully (soft delete)"}}
"""

for module, (model, schema_resp, schema_base, name) in models_map.items():
    with open(f"routers/admin/{module}.py", "w", encoding="utf-8") as f:
        f.write(template.format(model=model, schema_resp=schema_resp, schema_base=schema_base, name=name))

# For more complex ones like customers, users, contacts, rules, sla, integrations, dashboard, permissions, workflow
complex_modules = ["customers", "contacts", "users", "workflow", "sla", "rules", "integrations", "dashboard", "permissions", "parameters"]

for m in complex_modules:
    with open(f"routers/admin/{m}.py", "w", encoding="utf-8") as f:
        f.write(f"from fastapi import APIRouter, Depends\\nfrom sqlalchemy.orm import Session\\nimport models, schemas, auth\\nfrom database import get_db\\n\\nrouter = APIRouter()\\n# TODO: Implement {m} CRUD\\n")

print("Generated router files")
