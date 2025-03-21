# app/openai_service.py
from dotenv import load_dotenv
import os
import time
import json
import random
import logging
from typing import Dict, List, Optional, Any

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Get OpenAI API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
USE_MOCK = True if not OPENAI_API_KEY else False

# Try to import OpenAI library
try:
    import openai
    # Create OpenAI client if API key exists
    if not USE_MOCK:
        try:
            client = openai.OpenAI(api_key=OPENAI_API_KEY)
            logger.info("Successfully initialized OpenAI client")
        except Exception as e:
            logger.error(f"Error initializing OpenAI client: {e}")
            USE_MOCK = True
    else:
        logger.warning("No OpenAI API key found, using mock response mode")
        client = None
except ImportError:
    logger.warning("OpenAI library not installed, using mock response mode")
    USE_MOCK = True
    client = None

def generate_car_review(car_data: Dict[str, Any]) -> Optional[str]:
    """
    Generate a detailed car review using OpenAI's API or a mock response.
    
    Returns a JSON string with the review content.
    """
    # Validate car data
    if not car_data or not isinstance(car_data, dict):
        logger.error(f"Invalid car data provided: {car_data}")
        return json.dumps({
            "review_title": "Error: Invalid Car Data",
            "rating": 0,
            "review_text": "Unable to generate review due to missing or invalid car data.",
            "author": "System"
        })
    
    # Log the actual car we're reviewing to aid debugging
    car_info = f"{car_data.get('year', 'Unknown')} {car_data.get('manufacturer', 'Unknown')} {car_data.get('model', 'Unknown')}"
    logger.info(f"Attempting to generate review for: {car_info} (ID: {car_data.get('id', 'Unknown')})")
    
    if USE_MOCK:
        logger.info(f"Using mock review generator for: {car_info}")
        return generate_mock_review(car_data)
        
    try:
        prompt = f"""
        Write a detailed car review for a {car_data['year']} {car_data['manufacturer']} {car_data['model']}.
        
        Technical Specifications:
        - Engine: {car_data.get('engine_info', 'N/A')}
        - Transmission: {car_data.get('transmission', 'N/A')}
        - Fuel Type: {car_data.get('fuel_type', 'N/A')}
        - MPG: {car_data.get('mpg', 'N/A')}
        - Body Type: {car_data.get('body_type', 'N/A')}
        
        Write a thorough review that includes:
        1. A descriptive title
        2. Overall rating (1-5 stars)
        3. A comprehensive evaluation of the car's performance
        4. Specific mentions of the technical features
        5. Personal driving experience
        6. Value for money assessment
        
        Format the response as JSON with these fields:
        - review_title
        - rating (number between 1-5)
        - review_text
        - author (an automotive expert name)
        """
        
        # Using the new OpenAI API format
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an experienced automotive journalist with 20 years of experience reviewing cars. You provide detailed, honest, and technically accurate reviews."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            # Extract content from the response
            content = response.choices[0].message.content
            logger.info(f"Successfully generated review with OpenAI for: {car_info}")
            return content
        except Exception as e:
            logger.error(f"Error in OpenAI API call: {e}")
            logger.info(f"Falling back to mock review for: {car_info}")
            return generate_mock_review(car_data)
            
    except Exception as e:
        logger.error(f"Error generating review with OpenAI: {e}")
        # Fall back to mock review
        logger.info(f"Falling back to mock review due to error for: {car_info}")
        return generate_mock_review(car_data)

def generate_mock_review(car_data: Dict[str, Any]) -> str:
    """Generate a mock review when OpenAI API is unavailable."""
    # Ensure we have valid car data
    if not car_data or not isinstance(car_data, dict):
        car_data = {
            'year': 'Unknown',
            'manufacturer': 'Unknown',
            'model': 'Unknown',
            'body_type': 'vehicle',
            'engine_info': 'engine',
            'transmission': 'transmission',
            'fuel_type': 'fuel',
            'mpg': 0
        }
    
    # Log what we're actually reviewing
    car_info = f"{car_data.get('year', 'Unknown')} {car_data.get('manufacturer', 'Unknown')} {car_data.get('model', 'Unknown')}"
    logger.info(f"Generating mock review for: {car_info}")
    
    # Sample author names
    authors = [
        "Michael Thompson", "Sarah Johnson", "James Rodriguez", "Emma Davis",
        "Robert Chen", "Lisa Patel", "David Wilson", "Maria Garcia"
    ]
    
    # Create a random but somewhat realistic rating
    rating = round(random.uniform(3.0, 5.0), 1)
    
    # Create a random title
    adjectives = ["Impressive", "Solid", "Remarkable", "Exceptional", "Outstanding", "Excellent", "Competent"]
    title_templates = [
        f"The {random.choice(adjectives)} {car_data['year']} {car_data['manufacturer']} {car_data['model']}: A Comprehensive Review",
        f"{car_data['year']} {car_data['manufacturer']} {car_data['model']} Review: {random.choice(adjectives)} Performance and Value",
        f"Road Test: {car_data['year']} {car_data['manufacturer']} {car_data['model']} Delivers {random.choice(adjectives)} Results"
    ]
    
    # Generate paragraph templates
    intro = f"The {car_data['year']} {car_data['manufacturer']} {car_data['model']} is a {random.choice(['competitive', 'impressive', 'solid', 'noteworthy'])} entry in the {car_data.get('body_type', 'vehicle')} segment. With its {car_data.get('engine_info', 'engine')}, it offers a good balance of performance and efficiency."
    
    performance = f"In terms of performance, the {car_data['model']} {random.choice(['delivers', 'provides', 'offers'])} {random.choice(['responsive', 'adequate', 'impressive', 'satisfying'])} acceleration and handling. The {car_data.get('transmission', 'transmission')} is {random.choice(['smooth', 'refined', 'responsive', 'well-tuned'])}, and the ride quality is {random.choice(['comfortable', 'well-balanced', 'composed', 'refined'])}."
    
    interior = f"Inside, the {car_data['model']} features a {random.choice(['well-designed', 'practical', 'thoughtful', 'modern'])} cabin with {random.choice(['good', 'ample', 'adequate', 'generous'])} space for passengers and cargo. The materials are {random.choice(['high-quality', 'decent', 'appropriate for the price point', 'well-assembled'])}, and the technology features are {random.choice(['intuitive', 'user-friendly', 'comprehensive', 'up-to-date'])}."
    
    value = f"When it comes to value, the {car_data['year']} {car_data['manufacturer']} {car_data['model']} {random.choice(['represents', 'offers', 'delivers', 'provides'])} {random.choice(['strong', 'competitive', 'compelling', 'good'])} value in its segment. With a {rating} out of 5 rating, it's {random.choice(['definitely worth considering', 'a solid choice', 'recommended for most buyers', 'competitive in its class'])}."
    
    # Combine paragraphs
    review_text = f"{intro}\n\n{performance}\n\n{interior}\n\n{value}"
    
    # Create a JSON response
    mock_review = {
        "review_title": random.choice(title_templates),
        "rating": rating,
        "review_text": review_text,
        "author": random.choice(authors)
    }
    
    return json.dumps(mock_review)