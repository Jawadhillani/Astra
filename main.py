# app/main.py

import os
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text, or_, func
from pydantic import BaseModel
from app.database import engine, get_db
from app.base import Base 
from app.models.car import Car
from app.models.review import Review
from app.schemas import CarResponse
from typing import List, Optional
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import json
from datetime import datetime

# Load environment variables
load_dotenv()

# Import Supabase service methods
from app.supabase_service import (
    get_cars as supabase_get_cars,
    get_car_by_id as supabase_get_car,
    get_reviews_for_car as supabase_get_reviews,
    get_manufacturers as supabase_get_manufacturers,
    add_review as supabase_add_review
)

# Import OpenAI service for AI-generated reviews
try:
    from app.openai_service import generate_car_review
except ImportError:
    try:
        from app.ai_service import generate_car_review
    except ImportError:
        raise ImportError("AI service module not found")

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Define request model
class GenerateReviewRequest(BaseModel):
    car_id: int

# Attach CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Astra API"}

# ==========================
# Car Endpoints (Supabase + SQLite)
# ==========================

@app.get("/api/cars")
def get_cars(
    query: str = None, 
    manufacturer: str = None
):
    """Get cars from Supabase."""
    from app.supabase_service import get_cars
    cars = get_cars(query=query, manufacturer=manufacturer)
    return cars or []

@app.get("/api/cars/{car_id}")
def get_car(car_id: int):
    """Get a specific car by ID."""
    from app.supabase_service import get_car_by_id
    car = get_car_by_id(car_id)
    if not car:
        raise HTTPException(status_code=404, detail=f"Car with ID {car_id} not found")
    return car

@app.get("/api/cars/{car_id}/reviews")
def get_car_reviews(car_id: int):
    """Get reviews for a specific car."""
    from app.supabase_service import get_reviews_for_car
    
    # First check if car exists
    from app.supabase_service import get_car_by_id
    car = get_car_by_id(car_id)
    if not car:
        raise HTTPException(status_code=404, detail=f"Car with ID {car_id} not found")
    
    # Get reviews
    reviews = get_reviews_for_car(car_id)
    return reviews

@app.post("/api/reviews/generate")
async def generate_review(request: GenerateReviewRequest):
    """Generate a review for a car and save it to Supabase."""
    from app.supabase_service import get_car_by_id, add_review
    import datetime
    
    car_id = request.car_id
    logging.info(f"Generating review for car_id: {car_id}")
    
    # Check if car exists
    car_data = get_car_by_id(car_id)
    if not car_data:
        return JSONResponse(
            status_code=404,
            content={"detail": f"Car with ID {car_id} not found"}
        )
    
    # Generate mock review
    mock_review = {
        "review_title": f"AI Review: {car_data.get('year')} {car_data.get('manufacturer')} {car_data.get('model')}",
        "review_text": f"This is a test review for the {car_data.get('year')} {car_data.get('manufacturer')} {car_data.get('model')}. " +
                      f"The car has a {car_data.get('engine_info', 'modern')} engine and {car_data.get('transmission', 'smooth')} transmission. " +
                      "Overall, it's a good vehicle for its class.",
        "rating": 4.2,
        "author": "AI Reviewer",
        "review_date": datetime.datetime.utcnow().isoformat(),
        "is_ai_generated": True
    }
    
    # Add review to Supabase
    result = add_review(car_id, mock_review)
    if result:
        return result
    else:
        return JSONResponse(
            status_code=500,
            content={"detail": "Failed to add review to Supabase"}
        )

@app.get("/api/test-db")
def test_db():
    """Test Supabase connection."""
    from app.supabase_service import supabase
    
    if not supabase:
        return {
            "message": "Supabase client not initialized. Check your API key.",
            "status": "error"
        }
        
    try:
        response = supabase.table('cars').select('count').execute()
        car_count = len(response.data)
        
        return {
            "message": "Supabase connection successful",
            "cars_count": car_count,
            "status": "success"
        }
    except Exception as e:
        return {
            "message": f"Supabase connection failed: {str(e)}",
            "status": "error"
        }