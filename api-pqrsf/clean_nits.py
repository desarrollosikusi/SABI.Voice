import os
import re
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Customer

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/pqrsf_db")
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def clean_nits():
    db = SessionLocal()
    try:
        customers = db.query(Customer).all()
        for customer in customers:
            if customer.nit:
                cleaned_nit = re.sub(r'\D', '', customer.nit)
                if cleaned_nit != customer.nit:
                    print(f"Updating NIT for {customer.name}: {customer.nit} -> {cleaned_nit}")
                    customer.nit = cleaned_nit
        db.commit()
        print("Done!")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clean_nits()
