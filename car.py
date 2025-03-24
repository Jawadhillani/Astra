# app/models/car.py
from app.base import Base  # Import from base.py
from sqlalchemy import Column, Integer, String, Float

class Car(Base):
    __tablename__ = "cars"
    
    id = Column(Integer, primary_key=True, index=True)
    manufacturer = Column(String)
    model = Column(String)
    year = Column(Integer)
    body_type = Column(String)
    engine_info = Column(String)
    transmission = Column(String)
    fuel_type = Column(String)
    mpg = Column(Float)