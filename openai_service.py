# app/openai_service.py
from dotenv import load_dotenv
import os
import json
import random
import logging
import datetime
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
            "author": "System",
            "pros": [],
            "cons": []
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
        7. Clear lists of pros and cons (at least 3-5 of each)
        
        Make the review balanced, highlighting both strengths and weaknesses.
        
        Format the response as JSON with these fields:
        - review_title: a catchy title for the review
        - rating: number between 1-5 with one decimal point
        - review_text: detailed review text, around 300-500 words
        - author: an automotive expert name
        - pros: an array of strings, each describing a positive aspect of the car
        - cons: an array of strings, each describing a negative aspect of the car
        """
        
        # Using the new OpenAI API format
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an experienced automotive journalist with 20 years of experience reviewing cars. You provide detailed, honest, and technically accurate reviews that highlight both strengths and weaknesses."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1500
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

# Modified generate_mock_review function for shorter reviews
def generate_mock_review(car_data: Dict[str, Any]) -> str:
    """Generate a concise mock review with structured pros and cons."""
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
    logger.info(f"Generating concise mock review for: {car_info}")
    
    # Sample author names
    authors = [
        "Michael Thompson", "Sarah Johnson", "James Rodriguez", "Emma Davis",
        "Robert Chen", "Lisa Patel", "David Wilson", "Maria Garcia"
    ]
    
    # Determine review sentiment similar to before, but simplified
    sentiment = determine_sentiment(car_data)
    
    # Create a rating based on sentiment
    if sentiment == "positive":
        rating = round(random.uniform(4.0, 4.8), 1)
    elif sentiment == "neutral":
        rating = round(random.uniform(3.0, 3.9), 1)
    else:  # negative
        rating = round(random.uniform(1.8, 2.9), 1)
    
    # Shortened title options based on sentiment
    if sentiment == "positive":
        titles = [
            f"The {car_data['year']} {car_data['manufacturer']} {car_data['model']}: A Solid Choice",
            f"Impressive: {car_data['year']} {car_data['manufacturer']} {car_data['model']}",
            f"{car_data['year']} {car_data['manufacturer']} {car_data['model']} - Worth Your Attention"
        ]
    elif sentiment == "neutral":
        titles = [
            f"The {car_data['year']} {car_data['manufacturer']} {car_data['model']}: Mixed Results",
            f"Middle Ground: {car_data['year']} {car_data['manufacturer']} {car_data['model']}",
            f"{car_data['year']} {car_data['manufacturer']} {car_data['model']} - Has Potential"
        ]
    else:  # negative
        titles = [
            f"The {car_data['year']} {car_data['manufacturer']} {car_data['model']}: Room for Improvement",
            f"Disappointing: {car_data['year']} {car_data['manufacturer']} {car_data['model']}",
            f"{car_data['year']} {car_data['manufacturer']} {car_data['model']} - Look Elsewhere"
        ]
    
    # Get car details with sensible defaults
    car_body_type = car_data.get('body_type', 'vehicle')
    car_engine = car_data.get('engine_info', 'standard engine')
    car_mpg = car_data.get('mpg', 'competitive')
    
    # Generate a concise review text based on sentiment
    # Just two paragraphs: overview and conclusion
    paragraphs = []
    
    # Overview paragraph (shortened)
    if sentiment == "positive":
        paragraphs.append(f"The {car_data['year']} {car_data['manufacturer']} {car_data['model']} stands out in the {car_body_type} category with its {car_engine} providing strong performance while achieving {car_mpg} MPG. The ride quality, handling, and interior comfort are all above average for its class. Technology features are intuitive and add significant value to the overall package.")
    elif sentiment == "neutral":
        paragraphs.append(f"The {car_data['year']} {car_data['manufacturer']} {car_data['model']} offers adequate performance for a {car_body_type}, with its {car_engine} providing sufficient power for daily driving while returning {car_mpg} MPG. The ride quality and interior are satisfactory though unremarkable, and the technology features cover the basics without particularly impressing.")
    else:  # negative
        paragraphs.append(f"The {car_data['year']} {car_data['manufacturer']} {car_data['model']} falls short in the {car_body_type} segment. Its {car_engine} feels underpowered despite modest {car_mpg} MPG efficiency. The ride quality is compromised, interior materials disappoint, and the technology package lags behind competitors in both features and usability.")
    
    # Conclusion paragraph with rating (shortened)
    if sentiment == "positive":
        paragraphs.append(f"Overall, the {car_data['model']} earns a {rating}/5 rating. It excels in [performance/comfort/value] and offers a compelling package for buyers in this segment. While no vehicle is perfect, the few minor drawbacks are easily outweighed by its strengths.")
    elif sentiment == "neutral":
        paragraphs.append(f"With a {rating}/5 rating, the {car_data['model']} represents a middle-of-the-road option. It's worth consideration if you prioritize [specific strength], though competitors may offer better options depending on your specific needs and priorities.")
    else:  # negative
        paragraphs.append(f"I give the {car_data['model']} a {rating}/5 rating. Despite [minor positive aspect], its significant shortcomings in [key areas] make it difficult to recommend when more compelling options exist at similar price points.")
    
    # Combine paragraphs (just two now)
    review_text = "\n\n".join(paragraphs)
    
    # Generate pros and cons - keep these as they're valuable
    pros = generate_pros(car_data, sentiment)
    cons = generate_cons(car_data, sentiment)
    
    # Create a JSON response
    mock_review = {
        "review_title": random.choice(titles),
        "rating": rating,
        "review_text": review_text,
        "author": random.choice(authors),
        "pros": pros[:4],  # Limit to 4 pros max
        "cons": cons[:4]   # Limit to 4 cons max
    }
    
    return json.dumps(mock_review)

# Keep the determine_sentiment function the same
def determine_sentiment(car_data: Dict[str, Any]) -> str:
    """
    Determine the sentiment of the review based on car attributes or random selection.
    Returns "positive", "neutral", or "negative"
    """
    # Use a combination of car attributes and randomness
    # First, check if certain manufacturers or models tend to get better reviews
    manufacturer = car_data.get('manufacturer', '').lower()
    model = car_data.get('model', '').lower()
    year = car_data.get('year', 0)
    
    # Weights for each sentiment category (adjust these to change the distribution)
    sentiment_weights = {
        "positive": 40,   # 40% positive reviews
        "neutral": 40,    # 40% neutral reviews
        "negative": 20    # 20% negative reviews
    }
    
    # Adjust weights based on car attributes
    if manufacturer in ['tesla', 'toyota', 'lexus', 'honda']:
        # These brands tend to get more positive reviews
        sentiment_weights["positive"] += 15
        sentiment_weights["negative"] -= 10
    elif manufacturer in ['ford', 'chevrolet', 'volkswagen']:
        # These are middle-of-the-road
        sentiment_weights["neutral"] += 10
    elif manufacturer in ['fiat', 'mitsubishi']:
        # These brands tend to get more negative reviews
        sentiment_weights["negative"] += 15
        sentiment_weights["positive"] -= 10
    
    # Adjust for newer cars (newer cars tend to get better reviews)
    current_year = datetime.datetime.now().year
    if year >= current_year - 2:
        sentiment_weights["positive"] += 10
        sentiment_weights["negative"] -= 5
    elif year <= current_year - 10:
        sentiment_weights["negative"] += 15
        sentiment_weights["positive"] -= 10
    
    # Normalize weights to ensure they sum to 100
    total_weight = sum(sentiment_weights.values())
    normalized_weights = {k: (v / total_weight) * 100 for k, v in sentiment_weights.items()}
    
    # Generate a random number between 0 and 100
    rand_num = random.uniform(0, 100)
    
    # Determine sentiment based on the random number and weights
    if rand_num < normalized_weights["positive"]:
        return "positive"
    elif rand_num < normalized_weights["positive"] + normalized_weights["neutral"]:
        return "neutral"
    else:
        return "negative"

# Keep the pros and cons generation functions, but we'll use fewer items
def generate_pros(car_data: Dict[str, Any], sentiment: str) -> List[str]:
    """Generate a list of pros based on car data and sentiment"""
    # Common pros regardless of sentiment
    common_pros = [
        f"{car_data.get('transmission', 'Transmission')} shifts smoothly in normal driving",
        f"User-friendly infotainment system",
        f"Adequate {car_data.get('body_type', 'vehicle')} for daily commuting"
    ]
    
    # Additional pros based on sentiment
    if sentiment == "positive":
        possible_pros = [
            f"Excellent fuel economy at {car_data.get('mpg', '')} MPG",
            f"Responsive {car_data.get('engine_info', 'engine')}",
            f"Premium interior materials",
            f"Advanced technology features",
            f"Engaging handling dynamics",
            f"Comfortable and spacious seating",
            f"Superior build quality",
            f"Comprehensive safety features",
            f"Versatile cargo space"
        ]
        # Select fewer pros for positive reviews (3-4 total)
        return random.sample(possible_pros, k=min(3, len(possible_pros))) + random.sample(common_pros, k=1)
    
    elif sentiment == "neutral":
        possible_pros = [
            f"Decent fuel economy at {car_data.get('mpg', '')} MPG",
            f"Adequate power for most situations",
            f"Comfortable front seats",
            f"User-friendly controls",
            f"Reasonable cargo space",
            f"Balanced ride quality",
            f"Good visibility"
        ]
        # Select fewer pros for neutral reviews (2-3 total)
        return random.sample(possible_pros, k=min(2, len(possible_pros))) + random.sample(common_pros, k=1)
    
    else:  # negative
        possible_pros = [
            f"Acceptable fuel tank range",
            f"Basic {car_data.get('engine_info', 'engine')} works for urban driving",
            f"Entry-level trim offers value",
            f"Some thoughtful storage compartments",
            f"Distinctive styling"
        ]
        # Select fewer pros for negative reviews (1-2 total)
        return random.sample(possible_pros, k=min(2, len(possible_pros)))

def generate_cons(car_data: Dict[str, Any], sentiment: str) -> List[str]:
    """Generate a list of cons based on car data and sentiment"""
    # Common cons regardless of sentiment
    common_cons = [
        f"Advanced features only on higher trims",
        f"Standard warranty coverage",
        f"Interior storage could be improved"
    ]
    
    # Additional cons based on sentiment
    if sentiment == "positive":
        possible_cons = [
            f"Higher starting price than some rivals",
            f"Options increase price significantly",
            f"Limited rear visibility",
            f"Some advanced features have learning curve"
        ]
        # Select fewer cons for positive reviews (1-2 total)
        return random.sample(possible_cons, k=min(2, len(possible_cons)))
    
    elif sentiment == "neutral":
        possible_cons = [
            f"Fuel economy lags behind leaders",
            f"Performance is uninspiring",
            f"Inconsistent materials quality",
            f"Noticeable road noise at highway speeds",
            f"Dated infotainment graphics",
            f"Tight rear seating"
        ]
        # Select fewer cons for neutral reviews (2-3 total)
        return random.sample(possible_cons, k=min(3, len(possible_cons)))
    
    else:  # negative
        possible_cons = [
            f"Poor fuel economy",
            f"Underpowered engine",
            f"Transmission hesitates frequently",
            f"Cheap interior materials",
            f"Uncomfortable seating",
            f"Outdated technology",
            f"Excessive road noise",
            f"Unstable handling",
            f"Limited cargo space"
        ]
        # Select fewer cons for negative reviews (3-4 total)
        return random.sample(possible_cons, k=min(4, len(possible_cons)))
def generate_cons(car_data: Dict[str, Any], sentiment: str) -> List[str]:
    """Generate a list of cons based on car data and sentiment"""
    # Common cons regardless of sentiment
    common_cons = [
        f"Some advanced features only available on higher trims",
        f"Warranty coverage is standard but not exceptional",
        f"Interior storage could be better organized"
    ]
    
    # Additional cons based on sentiment
    if sentiment == "positive":
        possible_cons = [
            f"Slightly higher starting price than some competitors",
            f"Optional features can increase price significantly",
            f"Rear visibility could be improved",
            f"Learning curve for some advanced technology features",
            f"Firm ride might not appeal to all drivers",
            f"Requires premium fuel for optimal performance",
            f"Some controls could be more intuitively placed"
        ]
        # Select fewer cons for positive reviews
        return random.sample(possible_cons, k=min(3, len(possible_cons))) + random.sample(common_cons, k=1)
    
    elif sentiment == "neutral":
        possible_cons = [
            f"Fuel economy lags behind segment leaders",
            f"{car_data.get('engine_info', 'Engine')} performance is adequate but uninspiring",
            f"Interior materials quality is inconsistent",
            f"Noticeable road noise at highway speeds",
            f"Infotainment system graphics look dated",
            f"Rear seat space is tight for taller passengers",
            f"Handling becomes less composed on rough roads",
            f"Cargo area has awkward shape limitations",
            f"Some competitors offer better value",
            f"Predicted reliability is average for the segment"
        ]
        # Select a moderate number of cons for neutral reviews
        return random.sample(possible_cons, k=min(5, len(possible_cons))) + random.sample(common_cons, k=1)
    
    else:  # negative
        possible_cons = [
            f"Poor fuel economy relative to segment competitors",
            f"Underpowered {car_data.get('engine_info', 'engine')} struggles during acceleration",
            f"{car_data.get('transmission', 'Transmission')} exhibits frequent hesitation and rough shifts",
            f"Interior materials feel cheap and prone to wear",
            f"Uncomfortable seating becomes evident on longer drives",
            f"Frustrating and outdated infotainment interface",
            f"Excessive road and wind noise intrudes into cabin",
            f"Handling feels unstable during emergency maneuvers",
            f"Limited cargo capacity compared to competitors",
            f"Concerning predicted reliability ratings",
            f"Subpar safety scores in certain crash tests",
            f"Poor value proposition considering features and performance",
            f"Cramped rear seating for adult passengers",
            f"Cheap-feeling interior control knobs and buttons",
            f"Disappointing real-world efficiency falls below EPA estimates"
        ]
        # Select more cons for negative reviews
        return random.sample(possible_cons, k=min(8, len(possible_cons))) + random.sample(common_cons, k=1)