# app/supabase_service.py
import os
import logging
import json
from datetime import datetime, timedelta
import random
from typing import List, Dict, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_API_KEY")

# Log what values we're using (without revealing the full API key)
if SUPABASE_URL:
    logger.info(f"Using Supabase URL: {SUPABASE_URL}")
else:
    logger.error("SUPABASE_URL not found in environment variables")

if SUPABASE_KEY:
    # Only show the first 8 characters of the API key
    masked_key = SUPABASE_KEY[:8] + "..." if len(SUPABASE_KEY) > 8 else "***"
    logger.info(f"Using Supabase API key: {masked_key}")
else:
    logger.error("SUPABASE_API_KEY not found in environment variables")

# Initialize Supabase client
supabase = None
try:
    # Only try to import and initialize if we have credentials
    if SUPABASE_URL and SUPABASE_KEY:
        from supabase import create_client, Client
        # Make sure the URL doesn't have any query parameters
        clean_url = SUPABASE_URL.split('?')[0]
        supabase = create_client(clean_url, SUPABASE_KEY)
        logger.info(f"Successfully initialized Supabase client")
except Exception as e:
    logger.error(f"Failed to initialize Supabase client: {str(e)}")
    supabase = None

# ====================================
# IN-MEMORY FALLBACK DATA
# ====================================
# This replaces the SQLite fallback with simple in-memory data
# These sample cars will be used when Supabase is unavailable
FALLBACK_CARS = [
    {
        "id": 1,
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
        "id": 2,
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
        "id": 3,
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
        "id": 4,
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
        "id": 5,
        "manufacturer": "Honda", 
        "model": "Civic", 
        "year":
        2023,
        "body_type": "Sedan",
        "engine_info": "1.5L Turbocharged I4",
        "transmission": "CVT",
        "fuel_type": "Gasoline",
        "mpg": 36
    }
]

# Sample reviews for each car
FALLBACK_REVIEWS = {}
authors = ["John Smith", "Maria Garcia", "Robert Chen", "Sarah Johnson", "James Wilson"]

for car in FALLBACK_CARS:
    car_id = car["id"]
    FALLBACK_REVIEWS[car_id] = []
    
    # Generate 2-3 reviews per car
    for i in range(random.randint(2, 3)):
        review_date = datetime.now() - timedelta(days=random.randint(1, 60))
        rating = round(random.uniform(3.5, 5.0), 1)
        
        review = {
            "id": int(f"{car_id}0{i+1}"),  # Simple ID generation
            "car_id": car_id,
            "author": random.choice(authors),
            "review_title": f"Review of {car['manufacturer']} {car['model']}",
            "review_text": f"This is a sample review for the {car['year']} {car['manufacturer']} {car['model']}. The car performs well and meets expectations.",
            "rating": rating,
            "review_date": review_date.isoformat(),
            "is_ai_generated": False
        }
        
        FALLBACK_REVIEWS[car_id].append(review)

def is_using_fallback():
    """Check if we're using the fallback data source."""
    return supabase is None

def get_cars(limit: int = 50, query: Optional[str] = None, manufacturer: Optional[str] = None) -> List[Dict]:
    """
    Get cars from Supabase or fallback to sample data.
    
    Args:
        limit: Maximum number of cars to return
        query: Search query for manufacturer or model
        manufacturer: Filter by manufacturer
        
    Returns:
        List of car dictionaries
    """
    if not supabase:
        logger.warning("Using fallback car data")
        # Filter the fallback cars based on query parameters
        filtered_cars = FALLBACK_CARS
        
        if query:
            query = query.lower()
            filtered_cars = [
                car for car in filtered_cars 
                if query in car.get('manufacturer', '').lower() or 
                   query in car.get('model', '').lower()
            ]
        
        if manufacturer:
            manufacturer = manufacturer.lower()
            filtered_cars = [
                car for car in filtered_cars 
                if manufacturer == car.get('manufacturer', '').lower()
            ]
            
        return filtered_cars[:limit]
        
    try:
        # Start with a base query
        db_query = supabase.table('cars').select('*')
        
        # Apply filters
        if query:
            # Search in both manufacturer and model columns
            db_query = db_query.or_(f"manufacturer.ilike.%{query}%,model.ilike.%{query}%")
        
        if manufacturer:
            db_query = db_query.eq('manufacturer', manufacturer)
            
        # Execute the query
        response = db_query.limit(limit).execute()
        
        if response.data:
            logger.info(f"Found {len(response.data)} cars in Supabase")
            return response.data
        else:
            logger.warning("No cars found in Supabase")
            return []
            
    except Exception as e:
        logger.error(f"Error fetching cars from Supabase: {str(e)}")
        logger.warning("Falling back to sample car data")
        return get_cars(limit, query, manufacturer)  # Recursively call using fallback

def get_car_by_id(car_id: int) -> Optional[Dict]:
    """
    Get a car by ID from Supabase or fallback data.
    
    Args:
        car_id: The ID of the car to retrieve
        
    Returns:
        Car dictionary or None if not found
    """
    if not supabase:
        logger.warning(f"Using fallback data for car ID {car_id}")
        # Find the car in our fallback data
        for car in FALLBACK_CARS:
            if car['id'] == car_id:
                return car
        return None
        
    try:
        response = supabase.table('cars').select('*').eq('id', car_id).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        else:
            logger.warning(f"Car with ID {car_id} not found in Supabase")
            return None
            
    except Exception as e:
        logger.error(f"Error fetching car from Supabase: {str(e)}")
        return get_car_by_id(car_id)  # Recursively call using fallback

def get_manufacturers() -> List[str]:
    """
    Get a list of all unique manufacturers from Supabase or fallback data.
    
    Returns:
        List of manufacturer names
    """
    if not supabase:
        logger.warning("Using fallback data for manufacturers")
        # Extract unique manufacturers from our fallback data
        manufacturers = list(set(car.get('manufacturer', '') for car in FALLBACK_CARS if car.get('manufacturer')))
        return manufacturers
        
    try:
        # Select only the manufacturer column
        response = supabase.table('cars').select('manufacturer').execute()
        
        if not response.data:
            logger.warning("No manufacturers found in Supabase")
            return []
            
        # Extract unique manufacturer names
        manufacturers = []
        seen = set()
        for item in response.data:
            if item.get('manufacturer') and item['manufacturer'] not in seen and item['manufacturer'] != '':
                seen.add(item['manufacturer'])
                manufacturers.append(item['manufacturer'])
        
        logger.info(f"Found {len(manufacturers)} unique manufacturers")
        return manufacturers
        
    except Exception as e:
        logger.error(f"Error fetching manufacturers from Supabase: {str(e)}")
        return get_manufacturers()  # Recursively call using fallback

def get_reviews_for_car(car_id: int) -> List[Dict]:
    """
    Get reviews for a specific car from Supabase or fallback data.
    
    Args:
        car_id: The ID of the car
        
    Returns:
        List of review dictionaries
    """
    if not supabase:
        logger.warning(f"Using fallback data for reviews of car ID {car_id}")
        return FALLBACK_REVIEWS.get(car_id, [])
        
    try:
        response = supabase.table('reviews').select('*').eq('car_id', car_id).execute()
        
        if response.data:
            logger.info(f"Found {len(response.data)} reviews for car ID {car_id}")
            return response.data
        else:
            logger.warning(f"No reviews found for car ID {car_id}")
            return []
            
    except Exception as e:
        logger.error(f"Error fetching reviews from Supabase: {str(e)}")
        return get_reviews_for_car(car_id)  # Recursively call using fallback

# Modified add_review function to handle pros/cons correctly
def add_review(car_id: int, review_data: Dict) -> Optional[Dict]:
    """
    Add a new review for a car.
    
    Args:
        car_id: The ID of the car being reviewed
        review_data: Dictionary containing review details
        
    Returns:
        The created review or None if failed
    """
    if not supabase:
        logger.error("Supabase client not initialized. Check your API key.")
        return None
        
    try:
        # Create a modified version of the review data that's compatible with the database schema
        # Remove pros and cons from the database insert, but keep them in the return value
        db_compatible_review = review_data.copy()
        
        # Store pros and cons as separate variables but don't send to database
        pros = db_compatible_review.pop('pros', []) if 'pros' in db_compatible_review else []
        cons = db_compatible_review.pop('cons', []) if 'cons' in db_compatible_review else []
        
        # Add pros and cons to review_text if they exist
        if pros or cons:
            additional_text = "\n\n"
            if pros:
                additional_text += "PROS:\n" + "\n".join([f"- {pro}" for pro in pros]) + "\n\n"
            if cons:
                additional_text += "CONS:\n" + "\n".join([f"- {con}" for con in cons])
                
            # Append to review_text if it exists, otherwise create it
            if 'review_text' in db_compatible_review and db_compatible_review['review_text']:
                db_compatible_review['review_text'] += additional_text
            else:
                db_compatible_review['review_text'] = additional_text
        
        # Make sure car_id is included
        db_compatible_review['car_id'] = car_id
        
        # Insert into database
        response = supabase.table('reviews').insert(db_compatible_review).execute()
        
        if response.data and len(response.data) > 0:
            logger.info(f"Successfully added review for car ID {car_id}")
            
            # Add pros and cons back to the response data for the UI
            result = response.data[0]
            result['pros'] = pros
            result['cons'] = cons
            
            return result
        else:
            logger.error("Failed to insert review into Supabase")
            return None
            
    except Exception as e:
        logger.error(f"Error adding review to Supabase: {str(e)}")
        
        # For fallback mode
        if is_using_fallback():
            # Generate fallback review
            mock_review_id = f"{car_id}_{int(datetime.datetime.now().timestamp())}"
            result = {
                **db_compatible_review,
                'id': mock_review_id,
                'car_id': car_id,
                'pros': pros,
                'cons': cons
            }
            return result
            
        return None