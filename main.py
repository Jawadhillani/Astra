import os
import logging
from dotenv import load_dotenv
from pydantic import BaseModel
from fastapi import FastAPI, Depends, HTTPException, Body

# 1. Load environment variables
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import engine, get_db
from app.base import Base 
from app.models.car import Car
from app.models.review import Review
from app.schemas import CarResponse
from typing import List
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import json
from datetime import datetime
import openai

# IMPORTANT: Use the correct file name for your OpenAI service
from app.openai_service import generate_car_review

# Create tables (this will run on startup)
Base.metadata.create_all(bind=engine)

app = FastAPI()
class GenerateReviewRequest(BaseModel):
    car_id: int
# Attach CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Astra API"}

@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT 1")).fetchone()
        return {"message": "Database connection successful", "result": result[0]}
    except Exception as e:
        return {"message": "Database connection failed", "error": str(e)}

@app.get("/api/cars", response_model=List[CarResponse])
def get_cars(db: Session = Depends(get_db)):
    cars = db.query(Car).all()
    return cars

@app.get("/api/cars/{car_id}", response_model=CarResponse)
def get_car(car_id: int, db: Session = Depends(get_db)):
    car = db.query(Car).filter(Car.id == car_id).first()
    if car is None:
        raise HTTPException(status_code=404, detail="Car not found")
    return car

@app.get("/api/cars/search/", response_model=List[CarResponse])
def search_cars(manufacturer: str = None, model: str = None, year: int = None, db: Session = Depends(get_db)):
    query = db.query(Car)
    if manufacturer:
        query = query.filter(Car.manufacturer.ilike(f"%{manufacturer}%"))
    if model:
        query = query.filter(Car.model.ilike(f"%{model}%"))
    if year:
        query = query.filter(Car.year == year)
    return query.all()

@app.get("/api/cars/{car_id}/reviews")
def get_car_reviews(car_id: int, db: Session = Depends(get_db)):
    car = db.query(Car).filter(Car.id == car_id).first()
    if car is None:
        raise HTTPException(status_code=404, detail="Car not found")
    reviews = db.query(Review).filter(Review.car_id == car_id).all()
    return reviews

@app.get("/api/reviews/recent")
def get_recent_reviews(limit: int = 10, db: Session = Depends(get_db)):
    reviews = db.query(Review).order_by(Review.review_date.desc()).limit(limit).all()
    return reviews

@app.get("/api/cars/{car_id}/analysis")
def get_car_analysis(car_id: int, db: Session = Depends(get_db)):
    car = db.query(Car).filter(Car.id == car_id).first()
    if car is None:
        raise HTTPException(status_code=404, detail="Car not found")
    reviews = db.query(Review).filter(Review.car_id == car_id).all()
    if reviews:
        avg_rating = sum(r.rating for r in reviews) / len(reviews)
        total_reviews = len(reviews)
        positive_reviews = len([r for r in reviews if r.rating >= 4])
        negative_reviews = len([r for r in reviews if r.rating <= 2])
    else:
        avg_rating = 0
        total_reviews = 0
        positive_reviews = 0
        negative_reviews = 0
    return {
        "car": car,
        "statistics": {
            "average_rating": round(avg_rating, 2),
            "total_reviews": total_reviews,
            "positive_reviews": positive_reviews,
            "negative_reviews": negative_reviews,
            "positive_percentage": round((positive_reviews/total_reviews * 100) if total_reviews > 0 else 0, 2)
        }
    }

@app.get("/api/analysis/trends")
async def get_trends(db: Session = Depends(get_db)):
    return {"message": "Trends endpoint not implemented yet"}

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logging.error(f"Validation error: {exc}")
    return JSONResponse(
        status_code=422,
        content={"detail": str(exc)}
    )

@app.middleware("http")
async def log_requests(request, call_next):
    logging.info(f"Request to {request.url.path}")
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logging.error(f"Request failed: {str(e)}")
        raise

# Review generation endpoints (choose one for production)
@app.post("/api/reviews/generate")
async def generate_review(request: GenerateReviewRequest, db: Session = Depends(get_db)):
    """
    Generate an AI review for a car.
    Expects a JSON body with car_id field.
    """
    try:
        # Get car_id from request
        car_id = request.car_id
        logging.info(f"Generating review for car_id: {car_id}")
        
        # Get car from database
        car = db.query(Car).filter(Car.id == car_id).first()
        if not car:
            logging.error(f"Car with ID {car_id} not found")
            return JSONResponse(
                status_code=404,
                content={"detail": f"Car with ID {car_id} not found"}
            )
        
        logging.info(f"Found car: {car.manufacturer} {car.model}")
        
        # Create car data dictionary
        car_data = {
            'id': car.id,
            'manufacturer': car.manufacturer,
            'model': car.model,
            'year': car.year,
            'engine_info': car.engine_info,
            'transmission': car.transmission,
            'fuel_type': car.fuel_type,
            'mpg': car.mpg,
            'body_type': car.body_type
        }
        
        # Generate the review
        try:
            from app.openai_service import generate_car_review
        except ImportError:
            try:
                from app.ai_service import generate_car_review
            except ImportError:
                return JSONResponse(
                    status_code=500, 
                    content={"detail": "AI service module not found"}
                )
        
        generated_review = generate_car_review(car_data)
        
        try:
            # Parse the review JSON
            review_data = json.loads(generated_review)
            
            # Create a new review
            new_review = Review(
                car_id=car_id,
                review_title=review_data.get('review_title', f"AI Review: {car.year} {car.manufacturer} {car.model}"),
                review_text=review_data.get('review_text', "No review text generated."),
                rating=review_data.get('rating', 4.0),
                author=review_data.get('author', "AI Assistant"),
                review_date=datetime.utcnow(),
                is_ai_generated=True
            )
            
            # Save to database
            db.add(new_review)
            db.commit()
            db.refresh(new_review)
            
            return new_review
            
        except Exception as e:
            logging.error(f"Error processing review: {e}")
            
            # Create a simple review anyway
            new_review = Review(
                car_id=car_id,
                review_title=f"AI Review: {car.year} {car.manufacturer} {car.model}",
                review_text="An error occurred while generating the detailed review.",
                rating=3.0,
                author="AI Assistant",
                review_date=datetime.utcnow(),
                is_ai_generated=True
            )
            
            db.add(new_review)
            db.commit()
            db.refresh(new_review)
            
            return new_review
            
    except Exception as e:
        logging.error(f"Error in generate_review: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)}
        )
@app.get("/api/test/generate-review/{car_id}")
async def test_generate_review(car_id: int, db: Session = Depends(get_db)):
    """
    Test endpoint to generate a review without requiring a POST
    """
    try:
        logging.info(f"Testing review generation for car_id: {car_id}")
        
        # Get car from database
        car = db.query(Car).filter(Car.id == car_id).first()
        if not car:
            logging.error(f"Car with ID {car_id} not found")
            return JSONResponse(
                status_code=404,
                content={"detail": f"Car with ID {car_id} not found"}
            )
        
        logging.info(f"Found car: {car.manufacturer} {car.model}")
        
        # Create car data dictionary
        car_data = {
            'id': car.id,
            'manufacturer': car.manufacturer,
            'model': car.model,
            'year': car.year,
            'engine_info': car.engine_info,
            'transmission': car.transmission,
            'fuel_type': car.fuel_type,
            'mpg': car.mpg,
            'body_type': car.body_type
        }
        
        # Try to import the AI service
        try:
            from app.openai_service import generate_car_review
        except ImportError:
            try:
                from app.ai_service import generate_car_review
            except ImportError:
                return JSONResponse(
                    status_code=500, 
                    content={"detail": "AI service module not found"}
                )
        
        # Generate the review
        generated_review = generate_car_review(car_data)
        if not generated_review:
            return JSONResponse(
                status_code=500,
                content={"detail": "Failed to generate review"}
            )
        
        # Return the raw review text
        return {"generated_review": generated_review, "car_info": car_data}
        
    except Exception as e:
        logging.error(f"Error in test_generate_review: {str(e)}")
        import traceback
        logging.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)}
        )
# Optionally include ChatController router if needed
from app.ChatController import router as chat_router
app.include_router(chat_router, prefix="/api")
