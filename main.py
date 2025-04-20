# app/main.py

import os
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import json
from datetime import datetime
from fastapi import FastAPI
from app.enhanced_chat_controller_hybrid import router as chat_router
app = FastAPI()
app.include_router(chat_router, prefix="/api/chat")
# Add the enhanced router
app.include_router(chat_router)
load_dotenv()

# Import Supabase service methods (now contains in-memory fallback)
from app.supabase_service import (
    get_cars,
    get_car_by_id,
    get_reviews_for_car,
    get_manufacturers,
    add_review,
    is_using_fallback
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
app.include_router(chat_router)
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
# Car Endpoints
# ==========================

@app.get("/api/cars")
def api_get_cars(
    query: str = None, 
    manufacturer: str = None
):
    """Get cars from data source."""
    cars = get_cars(query=query, manufacturer=manufacturer)
    return cars or []

@app.get("/api/cars/{car_id}")
def api_get_car(car_id: int):
    """Get a specific car by ID."""
    car = get_car_by_id(car_id)
    if not car:
        raise HTTPException(status_code=404, detail=f"Car with ID {car_id} not found")
    return car

@app.get("/api/cars/{car_id}/reviews")
def api_get_car_reviews(car_id: int):
    """Get reviews for a specific car."""
    # First check if car exists
    car = get_car_by_id(car_id)
    if not car:
        raise HTTPException(status_code=404, detail=f"Car with ID {car_id} not found")
    
    # Get reviews
    reviews = get_reviews_for_car(car_id)
    return reviews

@app.post("/api/reviews/generate")
async def api_generate_review(request: GenerateReviewRequest):
    """Generate a review for a car and save it."""
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
    
    # Try to import and use OpenAI service if available
    try:
        from app.openai_service import generate_car_review
        ai_review = generate_car_review(car_data)
        if ai_review:
            try:
                review_data = json.loads(ai_review)
                # Merge the review data with our mock review template
                mock_review = {**mock_review, **review_data, "is_ai_generated": True}
            except Exception as e:
                logger.error(f"Failed to parse AI review: {str(e)}")
                logger.error("Using mock review instead")
    except Exception as e:
        logger.warning(f"OpenAI service not available: {str(e)}")
        logger.warning("Using mock review")
    
    # Add review to data store
    result = add_review(car_id, mock_review)
    if result:
        # Make sure we return the complete object including pros/cons to the client
        if 'pros' not in result:
            result['pros'] = mock_review.get('pros', [])
        if 'cons' not in result:
            result['cons'] = mock_review.get('cons', [])
            
        return result
    else:
        return JSONResponse(
            status_code=500,
            content={"detail": "Failed to add review"}
        )

@app.get("/api/test-db")
def test_db():
    """Test database connection."""
    fallback = is_using_fallback()
    
    if fallback:
        return {
            "message": "Using fallback database with sample data",
            "using_fallback": True,
            "status": "warning"
        }
        
    return {
        "message": "Database connection successful",
        "using_fallback": False,
        "status": "success"
    }