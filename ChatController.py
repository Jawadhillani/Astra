from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from pydantic import BaseModel
import logging

from app.database import get_db
from app.models.car import Car
from app.models.review import Review
from app.review_analysis_service import ReviewAnalysisService  # Import the new service
from app.conversation_history import ConversationHistory  # Assuming this is the conversation manager

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize services
conversation_manager = ConversationHistory()
review_analyzer = ReviewAnalysisService()

class Message(BaseModel):
    text: str
    sender: str

class ChatRequest(BaseModel):
    message: str
    car_id: Optional[int] = None
    conversation_history: Optional[List[Message]] = []

# Changed route from "/chat" to "/api/chat"
@router.post("/api/chat")
async def process_chat(request: ChatRequest, db: Session = Depends(get_db)):
    """Process a chat request by retrieving car data and generating a response."""
    try:
        # Retrieve car data if car_id is provided
        car_data = None
        reviews = []
        review_analysis = None
        
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
            reviews_query = db.query(Review).filter(Review.car_id == request.car_id).all()
            reviews = [
                {
                    "id": review.id,
                    "title": review.review_title,
                    "text": review.review_text,
                    "rating": review.rating,
                    "author": review.author,
                    "date": review.review_date.isoformat() if review.review_date else None
                }
                for review in reviews_query
            ]
            
            # Analyze reviews if available
            if reviews:
                review_analysis = review_analyzer.analyze_reviews(reviews)
        
        # Get conversation history (user_id assumed to be provided in the request or defaulted)
        user_id = request.user_id if hasattr(request, 'user_id') else "default_user"
        history = conversation_manager.get_history(user_id)
        
        # Generate response using the improved function (includes review_analysis now)
        response = generate_improved_response(
            request.message, 
            car_data, 
            reviews, 
            history,
            review_analysis
        )
        
        # Save this exchange to history
        conversation_manager.add_exchange(user_id, request.message, response)
        
        # Return both the text response and structured data (including category scores and sentiment)
        return {
            "response": response,
            "analysis": review_analysis,
            "car_data": car_data
        }
        
    except Exception as e:
        logger.error(f"Chat processing error: {str(e)}")
        return {"response": "I encountered an error while processing your request. Please try again."}

def generate_improved_response(
    user_message: str, 
    car_data: Optional[Dict] = None, 
    reviews: Optional[List] = None, 
    conversation_history: Optional[List] = None,
    review_analysis: Optional[Dict] = None
):
    """
    Generate a more sophisticated response based on a better understanding of user intent.
    Now includes review analysis data such as category scores and sentiment.
    """
    # Convert message to lowercase for easier matching
    user_message_lower = user_message.lower()
    
    # Define basic intents with associated keywords
    intent_patterns = {
        'greeting': ['hello', 'hi', 'hey', 'greetings'],
        'farewell': ['bye', 'goodbye', 'see you', 'thanks'],
        'spec_inquiry': ['mpg', 'gas', 'fuel', 'economy', 'engine', 'power', 'performance', 'transmission', 'horsepower', 'acceleration', 'top speed'],
        'comfort_inquiry': ['comfort', 'interior', 'seats', 'space', 'legroom', 'cabin', 'noise'],
        'reliability_inquiry': ['reliable', 'reliability', 'problems', 'issues', 'maintenance', 'repair'],
        'value_inquiry': ['price', 'cost', 'worth', 'value', 'expensive', 'cheap', 'affordable'],
        'comparison': ['compare', 'vs', 'versus', 'better than', 'worse than', 'difference'],
        'recommendation': ['recommend', 'should i', 'good choice', 'worth buying', 'suggest'],
        'pros_cons_inquiry': ['pros', 'cons', 'advantages', 'disadvantages', 'benefits', 'drawbacks'],
        'general_opinion': ['good', 'bad', 'like', 'opinion', 'review', 'think', 'feel']
    }
    
    # Determine the primary intent
    detected_intent = 'unknown'
    max_matches = 0
    for intent, keywords in intent_patterns.items():
        matches = sum(1 for keyword in keywords if keyword in user_message_lower)
        if matches > max_matches:
            max_matches = matches
            detected_intent = intent
    
    # If we don't have car data but the intent is specific, ask for details
    if car_data is None and detected_intent not in ['greeting', 'farewell', 'unknown']:
        return "I'd be happy to help with that. Which specific car model are you interested in?"
    
    # With car data available, craft specific responses
    if car_data:
        car_name = f"{car_data['year']} {car_data['manufacturer']} {car_data['model']}"
        
        if detected_intent == 'spec_inquiry':
            if any(term in user_message_lower for term in ['mpg', 'gas', 'fuel', 'economy']):
                if car_data.get('mpg'):
                    rating = ""
                    if car_data['mpg'] > 30:
                        rating = " That's excellent for its class."
                    elif car_data['mpg'] > 25:
                        rating = " That's about average for its class."
                    else:
                        rating = " That's below average for its class."
                    return f"The {car_name} has a fuel economy rating of {car_data['mpg']} MPG.{rating} Would you like to know about its engine or transmission as well?"
                else:
                    return f"I don't have fuel economy data for the {car_name}. Would you like to know about other specifications instead?"
            elif any(term in user_message_lower for term in ['engine', 'power', 'performance', 'horsepower']):
                if car_data.get('engine_info'):
                    return f"The {car_name} comes with a {car_data['engine_info']} engine, offering a good balance of power and efficiency. Is there anything specific about the engine you'd like to know?"
                else:
                    return f"I don't have detailed engine specifications for the {car_name}. Would you like to know about other features?"
            elif 'transmission' in user_message_lower:
                if car_data.get('transmission'):
                    return f"The {car_name} features a {car_data['transmission']} transmission, providing smooth shifting and responsiveness. Would you like to know more about the driving experience?"
                else:
                    return f"I don't have transmission information for the {car_name}. Is there something else you'd like to know?"
        
        elif detected_intent == 'pros_cons_inquiry':
            if review_analysis and (review_analysis.get('common_pros') or review_analysis.get('common_cons')):
                pros = review_analysis.get('common_pros', [])
                cons = review_analysis.get('common_cons', [])
                pros_text = "Key advantages include: " + ", ".join(pros) + "." if pros else ""
                cons_text = "Areas for improvement include: " + ", ".join(cons) + "." if cons else ""
                return f"Based on owner reviews of the {car_name}, I've identified some common pros and cons. {pros_text} {cons_text} Would you like more details?"
            else:
                return f"I don't have enough review data to identify specific pros and cons for the {car_name}. Would you like to know about its specifications instead?"
        
        elif detected_intent == 'general_opinion':
            if review_analysis and review_analysis.get('average_rating') is not None:
                avg_rating = review_analysis['average_rating']
                sentiment = review_analysis.get('sentiment', {})
                rating_description = (
                    "excellent" if avg_rating >= 4.5 else "very good" if avg_rating >= 4.0
                    else "good" if avg_rating >= 3.5 else "average" if avg_rating >= 3.0
                    else "below average" if avg_rating >= 2.5 else "poor"
                )
                total_reviews = sum(sentiment.values())
                positive_percent = round((sentiment.get('positive', 0) / total_reviews) * 100) if total_reviews > 0 else 0
                category_scores = review_analysis.get('category_scores', {})
                highest_category = max(category_scores.items(), key=lambda x: x[1], default=(None, 0))
                lowest_category = min(category_scores.items(), key=lambda x: x[1], default=(None, 5))
                category_text = ""
                if highest_category[0] and lowest_category[0]:
                    highest_name = highest_category[0].replace('_', ' ').title()
                    lowest_name = lowest_category[0].replace('_', ' ').title()
                    category_text = f" Owners rate its {highest_name} at {highest_category[1]}/5, while {lowest_name} scored {lowest_category[1]}/5."
                return f"The {car_name} has an overall rating of {avg_rating:.1f}/5 ({rating_description}) based on {total_reviews} reviews, with {positive_percent}% positive feedback.{category_text} Would you like more details?"
            elif reviews and len(reviews) > 0:
                avg_rating = sum(review.get('rating', 0) for review in reviews) / len(reviews)
                return f"Based on {len(reviews)} reviews, the {car_name} has an average rating of {avg_rating:.1f}/5. Would you like a detailed summary of the reviews?"
            else:
                return f"I don't have any review data for the {car_name} yet. Would you like to know about its specifications instead?"
                
        elif detected_intent == 'recommendation':
            recommendation = ""
            if review_analysis and review_analysis.get('average_rating') is not None:
                avg_rating = review_analysis['average_rating']
                if avg_rating >= 4.0:
                    recommendation = f"Based on an excellent average rating of {avg_rating:.1f}/5, the {car_name} is highly recommended by owners."
                elif avg_rating >= 3.5:
                    recommendation = f"With a good average rating of {avg_rating:.1f}/5, the {car_name} is generally recommended."
                else:
                    recommendation = f"With an average rating of {avg_rating:.1f}/5, the {car_name} receives mixed reviews."
                category_scores = review_analysis.get('category_scores', {})
                if category_scores:
                    highest_category = max(category_scores.items(), key=lambda x: x[1], default=(None, 0))
                    if highest_category[0]:
                        highest_name = highest_category[0].replace('_', ' ').title()
                        recommendation += f" It's particularly strong in {highest_name} with a score of {highest_category[1]}/5."
            elif car_data.get('mpg', 0) > 30:
                recommendation = f"If fuel economy is key, the {car_name} is an excellent choice with {car_data.get('mpg')} MPG."
            else:
                recommendation = f"The {car_name} is a solid choice with its {car_data.get('engine_info', 'modern engine')} and {car_data.get('transmission', 'responsive transmission')}."
            return f"{recommendation} What aspects are most important for you?"
        
        return f"The {car_name} is a {car_data.get('body_type', 'vehicle')} with a {car_data.get('engine_info', 'modern engine')}, featuring a {car_data.get('transmission', 'smooth transmission')} and running on {car_data.get('fuel_type', 'fuel')}. What would you like to know more about?"
    
    if detected_intent == 'greeting':
        return "Hello! I'm your automotive assistant. How can I help with your car-related questions today?"
        
    if detected_intent == 'farewell':
        return "Thanks for chatting! Feel free to return anytime you have more questions."
        
    return "I'm here to answer your car-related questions. What would you like to know about?"