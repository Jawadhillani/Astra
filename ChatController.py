from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from pydantic import BaseModel
import logging
from app.database import get_db
from app.models.car import Car
from app.models.review import Review

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class Message(BaseModel):
    text: str
    sender: str

class ChatRequest(BaseModel):
    message: str
    car_id: Optional[int] = None
    conversation_history: Optional[List[Message]] = []

@router.post("/chat")
async def process_chat(request: ChatRequest, db: Session = Depends(get_db)):
    """Process a chat request by retrieving car data and generating a response."""
    try:
        # Retrieve car data if car_id is provided
        car_data = None
        reviews = []
        
        if request.car_id:
            car = db.query(Car).filter(Car.id == request.car_id).first()
            if not car:
                return {"response": "I couldn't find information about that car in my database."}
                
            # Convert SQLAlchemy model to dictionary
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
            
            # Get reviews for this car
            reviews = db.query(Review).filter(Review.car_id == request.car_id).all()
            reviews = [
                {
                    "id": review.id,
                    "title": review.review_title,
                    "text": review.review_text,
                    "rating": review.rating,
                    "author": review.author,
                    "date": review.review_date.isoformat() if review.review_date else None
                }
                for review in reviews
            ]
        
        # For development, generate a simulated AI response based on the data
        response = generate_simulated_response(request.message, car_data, reviews)
        
        return {"response": response}
        
    except Exception as e:
        logger.error(f"Chat processing error: {str(e)}")
        return {"response": "I encountered an error while processing your request. Please try again."}

def generate_simulated_response(user_message: str, car_data: Optional[Dict] = None, reviews: Optional[List] = None):
    """
    Generate a simulated AI response during development.
    In production, this would be replaced by a call to an actual LLM API.
    """
    user_message_lower = user_message.lower()
    
    # If we have car data, use it to personalize responses
    if car_data:
        car_name = f"{car_data['year']} {car_data['manufacturer']} {car_data['model']}"
        
        if "mpg" in user_message_lower or "gas" in user_message_lower or "fuel" in user_message_lower or "economy" in user_message_lower:
            if car_data.get('mpg'):
                return f"The {car_name} has a fuel economy rating of {car_data['mpg']} MPG. This is {'excellent' if car_data['mpg'] > 30 else 'average' if car_data['mpg'] > 25 else 'below average'} for its class."
            else:
                return f"I don't have fuel economy data for the {car_name}."
                
        if "engine" in user_message_lower or "power" in user_message_lower or "performance" in user_message_lower:
            if car_data.get('engine_info'):
                return f"The {car_name} comes with a {car_data['engine_info']} engine, providing a good balance of power and efficiency."
            else:
                return f"I don't have engine specifications for the {car_name}."
                
        if "transmission" in user_message_lower:
            if car_data.get('transmission'):
                return f"The {car_name} features a {car_data['transmission']} transmission."
            else:
                return f"I don't have transmission information for the {car_name}."
                
        if "review" in user_message_lower or "opinion" in user_message_lower or "like" in user_message_lower or "good" in user_message_lower:
            if reviews and len(reviews) > 0:
                avg_rating = sum(review.get('rating', 0) for review in reviews) / len(reviews)
                return f"Based on {len(reviews)} reviews, the {car_name} has an average rating of {avg_rating:.1f}/5. " + \
                       f"Owners particularly {'appreciate' if avg_rating > 3.5 else 'mention'} its {car_data.get('body_type', 'design')}, " + \
                       f"{'efficient fuel economy' if car_data.get('mpg', 0) > 30 else 'performance'}."
            else:
                return f"I don't have any review data for the {car_name} yet."
                
        # Generic response about the car
        return f"The {car_name} is a {car_data.get('body_type', 'vehicle')} with a {car_data.get('engine_info', 'modern engine')}. " + \
               f"It features a {car_data.get('transmission', 'smooth transmission')} and runs on {car_data.get('fuel_type', 'fuel')}. " + \
               f"What specific aspect would you like to know more about?"
    
    if "help" in user_message_lower or "can you" in user_message_lower:
        return "I can provide information about car specifications, performance, fuel economy, and owner reviews. If you have a specific question about a car, feel free to ask!"
        
    if "hello" in user_message_lower or "hi" in user_message_lower:
        return "Hello! I'm your automotive assistant. How can I help you today?"
        
    return "I'm here to answer your car-related questions. I can provide information about specifications, reviews, or general automotive advice. What would you like to know?"
