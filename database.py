# app/database.py
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import logging
import os

# Import Base from base.py
from app.base import Base

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Use SQLite directly for now to ensure stability
sqlite_url = "sqlite:///./astra_cars.db"
engine = create_engine(sqlite_url, echo=True, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def populate_sample_data():
    """Populate the database with sample data"""
    from app.models.car import Car
    from app.models.review import Review
    from datetime import datetime, timedelta
    import random
    
    db = SessionLocal()
    
    try:
        # Check if we already have data
        car_count = db.query(Car).count()
        if car_count > 0:
            logger.info(f"Database already has {car_count} cars")
            return
            
        # Add sample cars
        sample_cars = [
            {
                "manufacturer": "Tesla", 
                "model": "Model 3", 
                "year": 2023,
                "body_type": "Sedan",
                "engine_info": "Electric Motor",
                "transmission": "Single-Speed",
                "fuel_type": "Electric",
                "mpg": 132
            },
            {
                "manufacturer": "BMW", 
                "model": "X5", 
                "year": 2022,
                "body_type": "SUV",
                "engine_info": "3.0L Turbocharged I6",
                "transmission": "8-Speed Automatic",
                "fuel_type": "Gasoline",
                "mpg": 26
            },
            {
                "manufacturer": "Toyota", 
                "model": "Camry", 
                "year": 2023,
                "body_type": "Sedan",
                "engine_info": "2.5L I4",
                "transmission": "8-Speed Automatic",
                "fuel_type": "Gasoline",
                "mpg": 32
            },
            {
                "manufacturer": "Ford", 
                "model": "F-150", 
                "year": 2022,
                "body_type": "Pickup",
                "engine_info": "3.5L EcoBoost V6",
                "transmission": "10-Speed Automatic",
                "fuel_type": "Gasoline",
                "mpg": 22
            },
            {
                "manufacturer": "Honda", 
                "model": "Civic", 
                "year": 2023,
                "body_type": "Sedan",
                "engine_info": "1.5L Turbocharged I4",
                "transmission": "CVT",
                "fuel_type": "Gasoline",
                "mpg": 36
            }
        ]
        
        # Add each car
        for car_data in sample_cars:
            car = Car(**car_data)
            db.add(car)
        
        # Commit to save cars and get their IDs
        db.commit()
        
        # Get all cars to add reviews
        cars = db.query(Car).all()
        
        # Sample authors
        authors = ["John Smith", "Maria Garcia", "Robert Chen", "Sarah Johnson", "James Wilson"]
        
        # Add reviews for each car
        for car in cars:
            # Add 2 reviews per car
            for i in range(2):
                review = Review(
                    car_id=car.id,
                    author=random.choice(authors),
                    review_title=f"Review of {car.manufacturer} {car.model}",
                    review_text=f"This is a sample review for the {car.year} {car.manufacturer} {car.model}. The car performs well and meets expectations.",
                    rating=random.uniform(3.5, 5.0),
                    review_date=datetime.now() - timedelta(days=random.randint(1, 60)),
                    is_ai_generated=False
                )
                db.add(review)
        
        # Commit reviews
        db.commit()
        logger.info(f"Added {len(cars)} cars with reviews to the database")
    
    except Exception as e:
        logger.error(f"Error populating sample data: {e}")
        db.rollback()
    finally:
        db.close()

# Populate the database with sample data
populate_sample_data()