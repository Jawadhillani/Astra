# app/ChatController.py
from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import logging
import re
import json
import random
import os
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Set this to True to force OpenAI to be used (for testing)
FORCE_OPENAI = True

# Try to import OpenAI
try:
    from openai import OpenAI  # Import OpenAI client class for v1.0+
    # Check if API key is available
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        # Initialize client with API key
        client = OpenAI(api_key=openai_api_key)
        use_openai = True
        logger.info("OpenAI integration enabled with new API client")
    else:
        use_openai = FORCE_OPENAI  # For testing
        client = None
        logger.warning(f"OPENAI_API_KEY not found, {'forcing' if FORCE_OPENAI else 'not using'} OpenAI")
except ImportError:
    use_openai = False
    client = None
    logger.warning("OpenAI package not installed, will use rule-based responses only")

# Simple in-memory conversation history
class ConversationHistory:
    def __init__(self):
        self.history = {}
    
    def get_history(self, user_id):
        if user_id not in self.history:
            self.history[user_id] = []
        return self.history[user_id]
    
    def add_exchange(self, user_id, user_message, ai_response):
        if user_id not in self.history:
            self.history[user_id] = []
        self.history[user_id].append({
            "user": user_message,
            "ai": ai_response,
            "timestamp": datetime.now().isoformat()
        })
        return True

# Initialize conversation manager
conversation_manager = ConversationHistory()

# Car features and specifications knowledge base
CAR_FEATURES = {
    "sedan": [
        "Four-door design with separate trunk",
        "Comfortable seating for 5 passengers",
        "Balanced fuel economy and performance",
        "Typically more affordable than SUVs"
    ],
    "suv": [
        "Higher ground clearance for better visibility",
        "Spacious interior with flexible cargo space",
        "Available in compact, midsize, and full-size options",
        "Many offer all-wheel drive capabilities",
        "Ideal for families and outdoor activities"
    ],
    "crossover": [
        "Combines SUV styling with car-like handling",
        "Better fuel efficiency than traditional SUVs",
        "More cargo space than sedans",
        "Comfortable ride and easy maneuverability"
    ],
    "pickup": [
        "Open cargo bed for hauling large items",
        "High towing capacities",
        "Available in full-size and midsize options",
        "Many offer 4x4 capability for off-road use",
        "Crew cab options provide seating for 5-6 passengers"
    ],
    "coupe": [
        "Sporty two-door design",
        "Sleek, aerodynamic styling",
        "Focus on performance and handling",
        "Usually offers more powerful engine options",
        "Limited rear passenger space"
    ],
    "diesel": [
        "Higher torque output for improved towing capability",
        "Better fuel economy on highway driving",
        "Engines typically last longer than gasoline engines",
        "Lower RPM operation reduces engine wear",
        "Improved fuel efficiency on longer trips"
    ],
    "hybrid": [
        "Combines gasoline engine with electric motors",
        "Improved fuel economy, especially in city driving",
        "Regenerative braking to recharge batteries",
        "Reduced emissions compared to conventional engines",
        "Some models offer electric-only driving mode"
    ],
    "electric": [
        "Zero tailpipe emissions",
        "Lower operating costs with no gasoline required",
        "Instant torque for quick acceleration",
        "Quieter operation than internal combustion engines",
        "Reduced maintenance with fewer moving parts"
    ],
    "awd": [
        "Power delivered to all four wheels",
        "Improved traction in slippery conditions",
        "Better handling and stability on varied terrain",
        "Enhanced performance in snow and rain",
        "Typically reduces fuel economy compared to 2WD"
    ],
    "safety": [
        "Advanced driver assistance systems (ADAS)",
        "Multiple airbags for front and side protection",
        "Anti-lock braking system (ABS)",
        "Electronic stability control",
        "Forward collision warning and automatic emergency braking",
        "Lane departure warning and lane keeping assistance",
        "Blind spot monitoring"
    ],
    "luxury": [
        "Premium interior materials (leather, wood, aluminum)",
        "Advanced infotainment and connectivity features",
        "Superior sound insulation for quieter cabin",
        "High-end audio systems",
        "Heated and ventilated seats",
        "Customizable ambient lighting",
        "Advanced climate control systems"
    ]
}

# Engine types information
ENGINE_INFO = {
    "v6": "V6 engines offer a good balance of power and fuel efficiency with six cylinders arranged in a V configuration.",
    "v8": "V8 engines provide high power output with eight cylinders arranged in a V configuration, ideal for larger vehicles and performance applications.",
    "i4": "Inline-4 (I4) engines are fuel-efficient 4-cylinder engines commonly used in compact and midsize vehicles.",
    "turbocharged": "Turbocharged engines use exhaust gases to drive a turbine that forces more air into the engine, increasing power output without increasing engine size.",
    "diesel": "Diesel engines use compression ignition instead of spark ignition, offering higher torque and better fuel economy, especially at highway speeds.",
    "hybrid": "Hybrid powertrains combine a gasoline engine with one or more electric motors to improve fuel efficiency and reduce emissions.",
    "electric": "Electric motors provide instant torque, zero emissions, and lower operating costs compared to internal combustion engines."
}

# Transmission types information
TRANSMISSION_INFO = {
    "automatic": "Automatic transmissions shift gears without driver input, offering convenience and ease of use.",
    "manual": "Manual transmissions require the driver to shift gears using a clutch pedal and gear selector, offering more control and often better fuel economy.",
    "cvt": "Continuously Variable Transmissions (CVT) provide seamless acceleration without distinct gear shifts, maximizing efficiency.",
    "dual-clutch": "Dual-clutch transmissions offer faster shifting than traditional automatics by using two separate clutches for odd and even gears.",
    "8-speed": "8-speed automatic transmissions provide a wide range of gear ratios for improved performance and fuel economy.",
    "10-speed": "10-speed automatic transmissions offer even more optimal gear ratios for enhanced efficiency and performance."
}

# Specs explanation
SPECS_EXPLANATION = {
    "mpg": "Miles Per Gallon (MPG) measures fuel efficiency - higher numbers mean better economy.",
    "hp": "Horsepower (HP) measures engine power output - higher numbers indicate more power.",
    "torque": "Torque measures rotational force, affecting acceleration and towing capability.",
    "0-60": "0-60 mph time measures acceleration performance - lower numbers indicate faster acceleration.",
    "cargo": "Cargo capacity measures available storage space, typically in cubic feet or liters.",
    "towing": "Towing capacity indicates the maximum weight a vehicle can safely tow.",
    "ground clearance": "Ground clearance is the distance between the lowest point of the vehicle and the ground."
}

# Quality comments for specific manufacturers
MANUFACTURER_INSIGHTS = {
    "bmw": [
        "BMW is known for its sporty handling and driver-focused experience.",
        "BMW's vehicles typically offer a good balance of performance and luxury.",
        "BMW's iDrive infotainment system has evolved to be one of the more intuitive systems.",
        "BMW diesel engines are known for their torque and efficiency on highway driving."
    ],
    "toyota": [
        "Toyota has built a reputation for reliability and longevity.",
        "Toyota's hybrid technology pioneered with the Prius has been refined over decades.",
        "Toyota vehicles typically have good resale value due to their reliability reputation.",
        "Toyota's safety systems (Toyota Safety Sense) come standard on most models."
    ],
    "honda": [
        "Honda is known for efficient engineering and practical design.",
        "Honda engines are often praised for their reliability and fuel efficiency.",
        "Honda vehicles typically offer more interior space than competitors of similar size.",
        "Honda's CVT transmissions have been refined to reduce the 'rubber band' feeling."
    ],
    "ford": [
        "Ford's F-Series has been America's best-selling truck for over 40 years.",
        "Ford's EcoBoost engines provide good power while improving fuel economy.",
        "Ford has invested heavily in both hybrid and all-electric technology.",
        "Ford's SYNC infotainment system has improved significantly in recent generations."
    ],
    "tesla": [
        "Tesla pioneered long-range electric vehicles with practical everyday usability.",
        "Tesla's Supercharger network is one of the most extensive fast-charging networks.",
        "Tesla vehicles receive regular over-the-air updates that add features and improve performance.",
        "Tesla's minimalist interior design focuses on the central touchscreen interface."
    ]
}

# Specific models information
MODEL_INSIGHTS = {
    "x5": [
        "The BMW X5 pioneered the luxury SUV segment when it was introduced in 1999.",
        "The X5 offers a blend of luxury, technology, and surprising off-road capability.",
        "X5 diesel models are known for their strong torque and highway fuel efficiency.",
        "The X5 features BMW's xDrive all-wheel-drive system for enhanced traction."
    ],
    "camry": [
        "The Toyota Camry has been America's best-selling sedan for many years.",
        "The Camry offers a spacious interior with comfortable seating for five.",
        "Camry Hybrid models offer exceptional fuel economy without sacrificing performance.",
        "The Camry's reputation for reliability makes it a popular choice for long-term ownership."
    ],
    "f-150": [
        "The Ford F-150 has been America's best-selling vehicle for over 40 years.",
        "F-150 models offer a wide range of engine choices and trim levels.",
        "The aluminum body introduced in 2015 reduced weight and improved fuel economy.",
        "The F-150's Pro Power Onboard system can provide electrical power for tools and equipment."
    ],
    "model 3": [
        "The Tesla Model 3 is one of the best-selling electric vehicles worldwide.",
        "The Model 3 offers impressive range and performance at a more accessible price point.",
        "The minimalist interior features a 15-inch touchscreen that controls most vehicle functions.",
        "Model 3 Performance variants offer acceleration comparable to high-end sports cars."
    ]
}


@router.post("/api/chat")
async def process_chat(data: dict = Body(...)):
    """Process a chat request and generate a response."""
    try:
        # Extract fields from the request body, with defaults if missing
        message = data.get("message", "")
        car_id = data.get("car_id")
        user_id = data.get("user_id", "default_user")
        conversation_history = data.get("conversation_history", [])
        
        # Log what we received
        logger.info(f"Received chat request: message='{message}', car_id={car_id}")
        
        # Get car data
        car_data = None
        available_cars = []
        try:
            from app.supabase_service import get_car_by_id, get_cars
            if car_id:
                car_data = get_car_by_id(car_id)
                logger.info(f"Retrieved car data: {car_data}")
            
            # Always try to get a sample of cars for context
            try:
                available_cars = get_cars(limit=15)
                logger.info(f"Got {len(available_cars)} cars for context")
            except Exception as e:
                logger.warning(f"Could not get available cars: {str(e)}")
        except Exception as e:
            logger.warning(f"Could not get car data: {str(e)}")
        
        if not message:
            return {"response": "I'm not sure what you're asking. Can you provide more details?"}
        
        # Always try to use OpenAI if it's enabled
        if use_openai and client:
            logger.info("Attempting to use OpenAI for response")
            try:
                # Create system message with car context
                system_message = create_system_message(available_cars, car_data)
                
                # Format conversation history
                messages = [
                    {"role": "system", "content": system_message}
                ]
                
                # Add relevant parts from conversation history
                if conversation_history:
                    # Process at most the last 10 messages
                    relevant_history = conversation_history[-10:]
                    for i, hist_msg in enumerate(relevant_history):
                        if hist_msg and isinstance(hist_msg, str):
                            role = "user" if i % 2 == 0 else "assistant"
                            messages.append({"role": role, "content": hist_msg})
                
                # Add current message
                messages.append({"role": "user", "content": message})
                
                logger.info(f"Sending {len(messages)} messages to OpenAI")
                
                # Call OpenAI API with the new client format
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=messages,
                    temperature=0.7,
                    max_tokens=1200
                )
                
                # Extract response (new format)
                ai_response = response.choices[0].message.content
                logger.info("Successfully got response from OpenAI")
                
                # Analyze response to extract structured data
                analysis = analyze_response(ai_response, car_data)
                
                # Save conversation to history
                conversation_manager.add_exchange(user_id, message, ai_response)
                
                # Return enhanced response
                return {
                    "response": ai_response,
                    "analysis": analysis,
                    "using_ai": True
                }
                
            except Exception as e:
                logger.error(f"OpenAI error: {str(e)}")
                # Let's return a direct error message if OpenAI fails
                if FORCE_OPENAI:
                    return {
                        "response": f"I'm currently having difficulty with my AI capabilities. Error: {str(e)}",
                        "error": str(e)
                    }
                logger.info("Falling back to rule-based response")
        
        # If we get here, use the rule-based system (your existing code)
        query_types = classify_query(message)
        logger.info(f"Classified query as: {query_types}")
        
        if car_data:
            # Handle specific query types
            if "features" in query_types:
                response = generate_features_response(car_data)
            elif "fuel_economy" in query_types:
                response = generate_fuel_economy_response(car_data)
            elif "specs" in query_types:
                response = generate_specs_response(car_data)
            elif query_types[0] in ["greeting", "farewell"]:
                response = generate_generic_response(car_data, query_types[0])
            else:
                # Default to features for now
                response = generate_features_response(car_data)
        else:
            # No car data available
            if "greeting" in query_types:
                response = "Hello! I'm your automotive assistant. How can I help you today?"
            elif "farewell" in query_types:
                response = "Goodbye! Feel free to return anytime you have more questions."
            else:
                response = "I'm here to provide information about vehicles in our database. Please select a vehicle to learn more about it."
        
        # Save this exchange to history
        conversation_manager.add_exchange(user_id, message, response)
        
        return {"response": response}
        
    except Exception as e:
        logger.error(f"Chat processing error: {str(e)}")
        return {"response": f"I apologize, but I encountered an error while processing your request. Please try again with a different question. Error: {str(e)}"}

def create_system_message(available_cars, specific_car):
    """Create a system message with car context."""
    system_message = """You are an intelligent automotive expert AI assistant. Your primary role is to provide helpful, accurate, and conversational information about cars.

IMPORTANT RULES:
1. Focus on vehicles from our database, but you CAN discuss general automotive topics and provide information even when specific data points are missing.
2. If asked about a specific car attribute that isn't in our data, acknowledge the limitation but still provide helpful general information about that attribute for that type of vehicle.
3. Make your answers conversational and natural - avoid sounding robotic or repetitive.
4. When appropriate, organize information into clear sections with bullet points for readability.
5. Respond directly to the user's query without repeating canned responses.
6. NEVER say "I don't have data" without providing alternative information.
7. Remember previous questions in the conversation and maintain a coherent dialogue.
8. If a user points out an issue with your responses, acknowledge it and improve.

For example, if asked about fuel economy but you don't have MPG data, you might say: "While I don't have the exact MPG figures for this model, similar vehicles in this class typically get around 25-30 MPG combined. The [car model] has a [engine size]L engine which balances performance and efficiency."
"""

    # Add available cars for context
    if available_cars:
        system_message += "\n\nVehicles in our database include:"
        car_count = 0
        for car in available_cars:
            if car.get('year') and car.get('manufacturer') and car.get('model'):
                system_message += f"\n- {car.get('year')} {car.get('manufacturer')} {car.get('model')}"
                car_count += 1
                if car_count >= 10:  # Limit to 10 cars to save token space
                    break
    
    # Add specific car details if available
    if specific_car:
        year = specific_car.get('year', '')
        manufacturer = specific_car.get('manufacturer', '')
        model = specific_car.get('model', '')
        
        if year and manufacturer and model:
            system_message += f"\n\nThe user is currently viewing the {year} {manufacturer} {model}."
            system_message += "\nHere are its specifications:"
            
            # Add each specification that exists
            for key, value in specific_car.items():
                if value and key not in ['id', 'created_at']:
                    system_message += f"\n- {key.replace('_', ' ')}: {value}"
            
            # Add special instructions for this car
            system_message += f"\n\nWhen discussing the {manufacturer} {model}, be informative and engaging. If you don't have specific data about a feature, you can discuss what similar vehicles in the {model}'s class typically offer."
    
    # Add final instruction for conversational approach
    system_message += "\n\nRemember to keep your responses conversational, helpful, and adaptive to the user's questions. Provide substantive information even when specific data points might be missing from our database."
    
    return system_message

def analyze_response(response_text, car_data):
    """Extract structured data from the AI response for UI components."""
    analysis = {
        "sentiment": {"positive": 0, "negative": 0, "neutral": 0},
        "common_pros": [],
        "common_cons": []
    }
    
    # Handle case where response_text might be None
    if not response_text:
        analysis["sentiment"]["neutral"] = 1
        return analysis
    
    # Extract pros if mentioned
    pros_pattern = r"(?:pros|advantages|benefits|strengths)[:\s]+(?:\n*(?:[-•*]\s*|\d+\.\s*)(.*?)(?:\n|$))+"
    pros_match = re.search(pros_pattern, response_text, re.IGNORECASE)
    if pros_match:
        pros_section = pros_match.group(0)
        bullet_matches = re.findall(r"[-•*]\s*(.*?)(?:\n|$)|\d+\.\s*(.*?)(?:\n|$)", pros_section)
        if bullet_matches:
            analysis["common_pros"] = [match[0] or match[1] for match in bullet_matches if match[0] or match[1]]
    
    # Extract cons if mentioned
    cons_pattern = r"(?:cons|disadvantages|drawbacks|limitations)[:\s]+(?:\n*(?:[-•*]\s*|\d+\.\s*)(.*?)(?:\n|$))+"
    cons_match = re.search(cons_pattern, response_text, re.IGNORECASE)
    if cons_match:
        cons_section = cons_match.group(0)
        bullet_matches = re.findall(r"[-•*]\s*(.*?)(?:\n|$)|\d+\.\s*(.*?)(?:\n|$)", cons_section)
        if bullet_matches:
            analysis["common_cons"] = [match[0] or match[1] for match in bullet_matches if match[0] or match[1]]
    
    # Simple sentiment analysis
    positive_keywords = ["excellent", "great", "good", "reliable", "recommend", "impressive", "best"]
    negative_keywords = ["poor", "bad", "avoid", "issue", "problem", "disappointing", "worst"]
    
    for keyword in positive_keywords:
        if re.search(r"\b" + re.escape(keyword) + r"\b", response_text, re.IGNORECASE):
            analysis["sentiment"]["positive"] += 1
    
    for keyword in negative_keywords:
        if re.search(r"\b" + re.escape(keyword) + r"\b", response_text, re.IGNORECASE):
            analysis["sentiment"]["negative"] += 1
    
    # Ensure we have some sentiment value
    if analysis["sentiment"]["positive"] == 0 and analysis["sentiment"]["negative"] == 0:
        analysis["sentiment"]["neutral"] = 1
    
    # Look for ratings mentions (e.g., "4.5 out of 5")
    rating_match = re.search(r"(\d+(\.\d+)?)\s*(?:out of|\/)\s*5", response_text, re.IGNORECASE)
    if rating_match:
        analysis["average_rating"] = float(rating_match.group(1))
    
    return analysis
def classify_query(message):
    message = message.lower() if message else ""
    
    # Define patterns for different query types
    patterns = {
        "greeting": r"\b(hello|hi|hey|greetings|good morning|good afternoon|good evening)\b",
        "farewell": r"\b(bye|goodbye|see you|later|farewell)\b",
        "features": r"\b(features?|what.*(?:has|includes?|comes? with)|equipped|options?)\b",
        "specs": r"\b(specs?|specifications?|details|technical|dimensions)\b",
        "fuel_economy": r"\b(fuel|mpg|mileage|gas|economy|efficient|consumption)\b",
        "performance": r"\b(performance|0-60|acceleration|speed|fast|quick|horsepower|hp|power|engine)\b",
        "safety": r"\b(safety|safe|crash|protection|airbags?|assists?)\b",
        "interior": r"\b(interior|inside|cabin|comfort|seats?|seating|room|space)\b",
        "exterior": r"\b(exterior|outside|looks?|design|style|appear|colors?)\b",
        "reliability": r"\b(reliability|reliable|dependable|quality|issues?|problems?|lasting)\b",
        "comparison": r"\b(compare|comparison|versus|vs\.?|better than|difference)\b",
        "price": r"\b(price|cost|expensive|cheap|afford|value|worth)\b",
        "recommendation": r"\b(recommend|should I|worth buying|good choice|suggest)\b",
        "technology": r"\b(tech|technology|infotainment|connectivity|features|screen|display|entertainment)\b",
        "opinion": r"\b(what.+think|your opinion|rate|review|thoughts)\b"
    }
    
    # Check patterns
    matched_types = []
    for query_type, pattern in patterns.items():
        if re.search(pattern, message):
            matched_types.append(query_type)
    
    if not matched_types:
        return ["general"]
    
    return matched_types

def generate_features_response(car_data):
    if not car_data:
        return "I need more information about the specific vehicle to tell you about its features."
        
    manufacturer = car_data.get('manufacturer', '').lower() if car_data.get('manufacturer') else ''
    model = car_data.get('model', '').lower() if car_data.get('model') else ''
    body_type = car_data.get('body_type', '').lower() if car_data.get('body_type') else ''
    year = car_data.get('year', '')
    engine_info = car_data.get('engine_info', '').lower() if car_data.get('engine_info') else ''
    
    response_parts = []
    response_parts.append(f"The {year} {car_data.get('manufacturer')} {car_data.get('model')} comes with several notable features:")
    
    # Add body type features if available
    if body_type and body_type in CAR_FEATURES:
        features = random.sample(CAR_FEATURES[body_type], min(3, len(CAR_FEATURES[body_type])))
        for feature in features:
            response_parts.append(f"• {feature}")
    
    # Add manufacturer insights if available
    if manufacturer in MANUFACTURER_INSIGHTS:
        insight = random.choice(MANUFACTURER_INSIGHTS[manufacturer])
        response_parts.append(f"• {insight}")
    
    # Add model insights if available
    model_key = next((key for key in MODEL_INSIGHTS.keys() if key in model), None)
    if model_key:
        insight = random.choice(MODEL_INSIGHTS[model_key])
        response_parts.append(f"• {insight}")
    
    # Add engine insights if available
    if engine_info:
        for engine_type, info in ENGINE_INFO.items():
            if engine_type in engine_info:
                response_parts.append(f"• {info}")
                break
    
    # Add a safety feature if we need more content
    if len(response_parts) < 5 and "safety" in CAR_FEATURES:
        safety_feature = random.choice(CAR_FEATURES["safety"])
        response_parts.append(f"• {safety_feature}")
    
    response_parts.append("\nWould you like to know more about its performance, interior, or safety features?")
    
    return "\n".join(response_parts)

def generate_fuel_economy_response(car_data):
    if not car_data:
        return "I need more information about the specific vehicle to tell you about its fuel economy."
        
    mpg = car_data.get('mpg')
    fuel_type = car_data.get('fuel_type', '').lower() if car_data.get('fuel_type') else ''
    
    if not mpg:
        return (
            f"I don't have specific fuel economy data for the {car_data.get('year')} "
            f"{car_data.get('manufacturer')} {car_data.get('model')}. "
            "Would you like information about its engine or other specifications instead?"
        )
    
    response = (
        f"The {car_data.get('year')} {car_data.get('manufacturer')} {car_data.get('model')} "
        f"has a fuel economy rating of {mpg} MPG."
    )
    
    if fuel_type and "diesel" in fuel_type:
        response += " Diesel engines typically offer better fuel economy on highway driving and higher torque for towing."
    elif fuel_type and "hybrid" in fuel_type:
        response += " As a hybrid vehicle, it achieves this efficiency by combining a gasoline engine with electric motors."
    elif fuel_type and "electric" in fuel_type:
        response += " As an electric vehicle, this MPG figure is actually an MPGe (Miles Per Gallon equivalent) rating."
    else:
        if mpg > 30:
            response += " This is above average for its class, making it a fuel-efficient option."
        elif mpg > 25:
            response += " This is about average for its class."
        else:
            response += " While not the most fuel-efficient in its class, it balances fuel economy with performance."
    
    return response

def generate_specs_response(car_data):
    if not car_data:
        return "I need more information about the specific vehicle to tell you about its specifications."
        
    response_parts = [f"Here are the key specifications for the {car_data.get('year')} {car_data.get('manufacturer')} {car_data.get('model')}:"]

    if car_data.get('engine_info'):
        response_parts.append(f"• Engine: {car_data.get('engine_info')}")
    elif car_data.get('engine_size'):
        response_parts.append(f"• Engine Size: {car_data.get('engine_size')}L")
    
    if car_data.get('transmission'):
        response_parts.append(f"• Transmission: {car_data.get('transmission')}")

    if car_data.get('fuel_type'):
        response_parts.append(f"• Fuel Type: {car_data.get('fuel_type')}")
    
    if car_data.get('mpg'):
        response_parts.append(f"• Fuel Economy: {car_data.get('mpg')} MPG")
    
    if car_data.get('body_type'):
        response_parts.append(f"• Body Style: {car_data.get('body_type')}")
    
    if car_data.get('year'):
        response_parts.append(f"• Year: {car_data.get('year')}")
    
    if car_data.get('price'):
        response_parts.append(f"• Price: ${car_data.get('price'):,}")
    
    # Add a spec explanation if relevant
    for spec in SPECS_EXPLANATION:
        if any(spec in part.lower() for part in response_parts):
            explanation = SPECS_EXPLANATION[spec]
            response_parts.append(f"\nNote: {explanation}")
            break
    
    response_parts.append("\nWhat specific aspect of this vehicle would you like to know more about?")
    return "\n".join(response_parts)

def generate_generic_response(car_data, query_type):
    if not car_data:
        if query_type == "greeting":
            return "Hello! I'm your automotive expert assistant. How can I help you today?"
        elif query_type == "farewell":
            return (
                "Thank you for using our automotive assistant. "
                "Feel free to return anytime you have more questions about vehicles in our database!"
            )
        return (
            "I'm here to provide information about vehicles in our database. "
            "How can I help you?"
        )
    
    if query_type == "greeting":
        return (
            f"Hello! I'm your automotive expert assistant. I have information about the "
            f"{car_data.get('year')} {car_data.get('manufacturer')} {car_data.get('model')}. "
            "What would you like to know about it?"
        )
    
    if query_type == "farewell":
        return (
            "Thank you for using our automotive assistant. "
            "Feel free to return anytime you have more questions about vehicles in our database!"
        )
    
    # For any other query type, give a helpful generic response
    return (
        f"I have detailed information about the {car_data.get('year')} "
        f"{car_data.get('manufacturer')} {car_data.get('model')}. You can ask about its features, "
        "specifications, fuel economy, performance, or any other aspect you're interested in."
    )
