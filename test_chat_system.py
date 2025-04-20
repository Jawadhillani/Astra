# test_chat_system.py
"""
Test script for the enhanced chat system.
This allows testing the system without a full FastAPI server.
"""

import os
import json
import logging
from dotenv import load_dotenv
import colorama
from colorama import Fore, Style
import argparse

# Import our modules
from query_classifier import QueryClassifier
from automotive_system_message import create_automotive_system_message
from response_analyzer import ResponseAnalyzer
from model_router import ModelRouter

# Initialize colorama for colored terminal output
colorama.init()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("test-chat-system")

# Load environment variables from .env file
load_dotenv()

def initialize_openai():
    """Initialize the OpenAI client."""
    try:
        from openai import OpenAI
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if openai_api_key:
            client = OpenAI(api_key=openai_api_key)
            logger.info("Successfully initialized OpenAI client")
            return client
        else:
            logger.error("OPENAI_API_KEY not found in environment variables")
            return None
    except ImportError:
        logger.error("openai package not installed")
        return None

def load_test_car_data():
    """Load sample car data for testing."""
    return {
        "id": 28,
        "manufacturer": "Dodge",
        "model": "Dart",
        "year": 2016,
        "price": None,
        "transmission": None,
        "fuel_type": None,
        "mpg": None,
        "engine_size": None,
        "created_at": "2025-02-19T09:25:55.34519+00:00",
        "body_type": "Sedan",
        "trim": None,
        "engine_info": "2.4L 4cyl 6M"
    }

def print_colored_json(data):
    """Print formatted JSON with colors."""
    formatted = json.dumps(data, indent=2)
    # Highlight keys in cyan, strings in green, numbers in yellow
    formatted = formatted.replace('"', f'{Fore.GREEN}"')
    lines = formatted.split('\n')
    for i, line in enumerate(lines):
        if ':' in line:
            key, value = line.split(':', 1)
            lines[i] = f"{Fore.CYAN}{key}{Fore.RESET}:{value}"
        if 'true' in line.lower() or 'false' in line.lower():
            lines[i] = lines[i].replace('true', f'{Fore.YELLOW}true{Fore.GREEN}')
            lines[i] = lines[i].replace('false', f'{Fore.YELLOW}false{Fore.GREEN}')
    print('\n'.join(lines) + Style.RESET_ALL)

def test_query_classifier():
    """Test the query classifier component."""
    print(f"\n{Fore.BLUE}=== Testing Query Classifier ==={Style.RESET_ALL}\n")
    
    classifier = QueryClassifier()
    test_queries = [
        "hello there",
        "what are the fuel economy numbers for this car?",
        "how reliable is the Dodge Dart?",
        "compare the Dart to the Honda Civic",
        "this is dumb",
        "thanks for your help",
        "what's the horsepower of the 2.4L engine?",
        "does it have Apple CarPlay?",
        "what do you think about the interior quality?"
    ]
    
    car_data = load_test_car_data()
    
    for query in test_queries:
        print(f"{Fore.YELLOW}Query:{Style.RESET_ALL} {query}")
        result = classifier.classify(query, car_data)
        print(f"{Fore.GREEN}Classification:{Style.RESET_ALL}")
        print_colored_json(result)
        print("\n" + "="*50 + "\n")

def test_automotive_system_message():
    """Test the automotive system message generator."""
    print(f"\n{Fore.BLUE}=== Testing Automotive System Message Generator ==={Style.RESET_ALL}\n")
    
    car_data = load_test_car_data()
    
    # Test with car data
    print(f"{Fore.YELLOW}With car data:{Style.RESET_ALL}")
    message = create_automotive_system_message(car_data)
    print(message)
    
    print("\n" + "="*50 + "\n")
    
    # Test without car data
    print(f"{Fore.YELLOW}Without car data:{Style.RESET_ALL}")
    message = create_automotive_system_message()
    print(message)

def test_response_analyzer():
    """Test the response analyzer component."""
    print(f"\n{Fore.BLUE}=== Testing Response Analyzer ==={Style.RESET_ALL}\n")
    
    analyzer = ResponseAnalyzer()
    car_data = load_test_car_data()
    
    test_response = """
    The 2016 Dodge Dart is a compact sedan that offers a blend of style and practicality. 
    
    Pros:
    • Spacious interior for its class
    • User-friendly infotainment system
    • Distinctive styling that stands out
    • Available with several engine options
    • Good safety ratings
    
    Cons:
    • Fuel economy lags behind some competitors
    • Acceleration is underwhelming with base engine
    • Reliability concerns for some model years
    • Interior materials quality is mixed
    
    Overall, I'd rate the 2016 Dodge Dart a 3.5 out of 5. It's a decent option in the compact sedan segment, though there are more refined competitors available.
    """
    
    print(f"{Fore.YELLOW}Sample Response:{Style.RESET_ALL}")
    print(test_response)
    
    print(f"\n{Fore.GREEN}Analysis:{Style.RESET_ALL}")
    analysis = analyzer.analyze(test_response, car_data)
    print_colored_json(analysis)

def test_full_conversation():
    """Test a full conversation with the model router."""
    print(f"\n{Fore.BLUE}=== Testing Full Conversation ==={Style.RESET_ALL}\n")
    
    # Initialize OpenAI client
    openai_client = initialize_openai()
    if not openai_client:
        print(f"{Fore.RED}Cannot test full conversation without OpenAI API key{Style.RESET_ALL}")
        return
    
    # Initialize model router with just OpenAI for now
    router = ModelRouter(openai_client)
    
    # Load car data
    car_data = load_test_car_data()
    
    # Test conversation
    conversation_history = []
    test_queries = [
        "hi there",
        "tell me about the Dodge Dart",
        "what's its fuel economy like?",
        "how does it compare to the Honda Civic?",
        "thanks for your help"
    ]
    
    for i, query in enumerate(test_queries):
        print(f"\n{Fore.YELLOW}User [{i+1}/{len(test_queries)}]:{Style.RESET_ALL} {query}")
        
        # Route query
        result = router.route_query(query, car_data, conversation_history)
        
        # Add to conversation history
        conversation_history.append(query)
        conversation_history.append(result["response"])
        
        # Print response
        print(f"\n{Fore.GREEN}Assistant ({result['model_used']}):{Style.RESET_ALL}")
        print(result["response"])
        
        # Print metadata
        print(f"\n{Fore.CYAN}Metadata:{Style.RESET_ALL}")
        metadata = {
            "model_used": result["model_used"],
            "confidence": result["confidence"],
            "query_types": result["query_types"],
            "response_time": f"{result['response_time']:.2f}s"
        }
        print_colored_json(metadata)
        print("\n" + "="*70 + "\n")

def main():
    parser = argparse.ArgumentParser(description='Test the chat system components')
    parser.add_argument('--all', action='store_true', help='Test all components')
    parser.add_argument('--classifier', action='store_true', help='Test query classifier')
    parser.add_argument('--message', action='store_true', help='Test system message generator')
    parser.add_argument('--analyzer', action='store_true', help='Test response analyzer')
    parser.add_argument('--conversation', action='store_true', help='Test full conversation')
    
    args = parser.parse_args()
    
    # If no specific tests are requested, test all
    test_all = args.all or not (args.classifier or args.message or args.analyzer or args.conversation)
    
    if test_all or args.classifier:
        test_query_classifier()
    
    if test_all or args.message:
        test_automotive_system_message()
    
    if test_all or args.analyzer:
        test_response_analyzer()
    
    if test_all or args.conversation:
        test_full_conversation()

if __name__ == "__main__":
    main()