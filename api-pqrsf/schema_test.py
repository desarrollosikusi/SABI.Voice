from database import SessionLocal
from models import Pqrsf
from schemas import PqrsfResponse
import json

db = SessionLocal()
pqrsf = db.query(Pqrsf).first()
if pqrsf:
    resp = PqrsfResponse.model_validate(pqrsf)
    print(resp.model_dump_json(indent=2))
else:
    print('No PQRSF found')
