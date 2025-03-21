# app/supabase_service.py
import os
import logging
from typing import List, Dict, Optional
from dotenv import load_dotenv
from supabase import create_client, Client

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
if SUPABASE_URL and SUPABASE_KEY:
    try:
        # Make sure the URL doesn't have any query parameters
        clean_url = SUPABASE_URL.split('?')[0]
        supabase = create_client(clean_url, SUPABASE_KEY)
        logger.info(f"Successfully initialized Supabase client")
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {str(e)}")
else:
    logger.error("Cannot initialize Supabase client: Missing URL or API key")

def get_cars(limit: int = 50, query: Optional[str] = None, manufacturer: Optional[str] = None) -> List[Dict]:
    """
    Get cars from Supabase.
    
    Args:
        limit: Maximum number of cars to return
        query: Search query for manufacturer or model
        manufacturer: Filter by manufacturer
        
    Returns:
        List of car dictionaries
    """
    if not supabase:
        logger.error("Supabase client not initialized. Check your API key.")
        return []
        
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
        return []

def get_car_by_id(car_id: int) -> Optional[Dict]:
    """
    Get a car by ID.
    
    Args:
        car_id: The ID of the car to retrieve
        
    Returns:
        Car dictionary or None if not found
    """
    if not supabase:
        logger.error("Supabase client not initialized. Check your API key.")
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
        return None

def get_manufacturers() -> List[str]:
    """
    Get a list of all unique manufacturers from Supabase.
    
    Returns:
        List of manufacturer names
    """
    if not supabase:
        logger.error("Supabase client not initialized. Check your API key.")
        return []
        
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
        return []

def get_reviews_for_car(car_id: int) -> List[Dict]:
    """
    Get reviews for a specific car.
    
    Args:
        car_id: The ID of the car
        
    Returns:
        List of review dictionaries
    """
    if not supabase:
        logger.error("Supabase client not initialized. Check your API key.")
        return []
        
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
        return []

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
        # Make sure car_id is included
        review_with_car_id = {**review_data, 'car_id': car_id}
        
        response = supabase.table('reviews').insert(review_with_car_id).execute()
        
        if response.data and len(response.data) > 0:
            logger.info(f"Successfully added review for car ID {car_id}")
            return response.data[0]
        else:
            logger.error("Failed to insert review into Supabase")
            return None
            
    except Exception as e:
        logger.error(f"Error adding review to Supabase: {str(e)}")
        return None