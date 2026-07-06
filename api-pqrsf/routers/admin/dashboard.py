from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db

router = APIRouter()
# TODO: Implement dashboard CRUD
