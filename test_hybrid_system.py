# test_hybrid_system.py
"""
Test script for the hybrid chat system.
This allows testing both models working together.
"""

import os
import json
import logging
import colorama
from colorama import Fore, Style
import argparse
from dotenv import load_dotenv

# Import our modules
try:
    from query_classifier import QueryClassifier
    from automotive_system_message import create_automotive_system_message
    from response_analyzer import ResponseAnalyzer
    from model_router import ModelRouter
    from local_llm_client import LocalLLMClient
except ImportError:
    # Try with relative imports
    from .query_classifier import QueryClassifier
    from .automotive_system_message import create_automotive_system_message
    from .response_analyzer import ResponseAnalyzer
    from .model_router import ModelRouter
    from .local_llm_client import LocalLLMClient

# Initialize colorama for colored terminal output
colorama.init()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("test-hybrid-system")

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

def initialize_local_llm():
    """Initialize the local LLM client."""
    try:
        client = LocalLLMClient()
        health = client.check_health()
        
        if health["status"] == "online":
            logger.info(f"Successfully initialized local LLM client")
            return client
        else:
            logger.error(f"Local LLM health check failed: {health}")
            return None
    except Exception as e:
        logger.error(f"Error initializing local LLM client: {str(e)}")
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

def test_full_hybrid_system():
    """Test the full hybrid system with both OpenAI and local models."""
    print(f"\n{Fore.BLUE}=== Testing Full Hybrid System ==={Style.RESET_ALL}\n")
    
    # Initialize both clients
    openai_client = initialize_openai()
    local_llm_client = initialize_local_llm()
    
    if not openai_client:
        print(f"{Fore.RED}OpenAI client not available. Testing with local only.{Style.RESET_ALL}")
    
    if not local_llm_client:
        print(f"{Fore.RED}Local LLM client not available. Testing with OpenAI only.{Style.RESET_ALL}")
    
    if not openai_client and not local_llm_client:
        print(f"{Fore.RED}Both models unavailable. Cannot continue.{Style.RESET_ALL}")
        return
    
    # Initialize the router with both clients
    router = ModelRouter(openai_client, local_llm_client)
    
    # Load car data
    car_data = load_test_car_data()
    
    # Define test queries for different scenarios
    test_queries = [
        {
            "name": "Greeting (should use OpenAI)",
            "query": "hi there, how are you today?",
            "expected_model": "openai"
        },
        {
            "name": "Automotive Technical (should use local)",
            "query": "what engine does the Dodge Dart have?",
            "expected_model": "local"
        },
        {
            "name": "Performance Question (should use local)",
            "query": "how is the acceleration in the Dart?",
            "expected_model": "local"
        },
        {
            "name": "General Question (should use OpenAI)",
            "query": "what's the weather like today?",
            "expected_model": "openai"
        },
        {
            "name": "Mixed Automotive (could use either)",
            "query": "why would someone buy a Dart instead of a Civic?",
            "expected_model": "local" if local_llm_client else "openai"
        }
    ]
    
    # Run the tests
    conversation_history = []
    
    for i, test in enumerate(test_queries):
        print(f"\n{Fore.CYAN}Test {i+1}/{len(test_queries)}: {test['name']}{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}Query:{Style.RESET_ALL} {test['query']}")
        print(f"{Fore.YELLOW}Expected Model:{Style.RESET_ALL} {test['expected_model']}")
        
        # Force specific model if needed for testing
        if test.get("force_model"):
            router.set_force_model(test["force_model"])
            print(f"{Fore.YELLOW}Forcing Model:{Style.RESET_ALL} {test['force_model']}")
        else:
            router.set_force_model(None)
        
        # Route query
        try:
            result = router.route_query(test["query"], car_data, conversation_history)
            
            # Add to conversation history
            conversation_history.append(test["query"])
            conversation_history.append(result["response"])
            
            # Print response
            print(f"\n{Fore.GREEN}Result:{Style.RESET_ALL}")
            print(f"Model Used: {Fore.MAGENTA}{result['model_used']}{Style.RESET_ALL} (Expected: {test['expected_model']})")
            print(f"Response Time: {Fore.YELLOW}{result['response_time']:.2f}s{Style.RESET_ALL}")
            print(f"Confidence: {Fore.YELLOW}{result['confidence']:.2f}{Style.RESET_ALL}")
            print(f"Query Types: {Fore.CYAN}{', '.join(result['query_types'])}{Style.RESET_ALL}")
            
            print(f"\n{Fore.GREEN}Response:{Style.RESET_ALL}")
            print(result["response"])
            
            print(f"\n{Fore.CYAN}Analysis:{Style.RESET_ALL}")
            print_colored_json(result["analysis"])
            
            # Check if model used matches expected
            if result["model_used"] == test["expected_model"]:
                print(f"\n{Fore.GREEN}✓ Model routing worked as expected{Style.RESET_ALL}")
            else:
                print(f"\n{Fore.YELLOW}⚠ Model routing differed from expected{Style.RESET_ALL}")
                
        except Exception as e:
            print(f"\n{Fore.RED}Error: {str(e)}{Style.RESET_ALL}")
        
        print("\n" + "="*80)
    
    # Print final metrics
    print(f"\n{Fore.BLUE}Final Metrics:{Style.RESET_ALL}")
    metrics = router.get_metrics()
    print_colored_json(metrics)

def test_individual_models():
    """Test each model individually."""
    print(f"\n{Fore.BLUE}=== Testing Individual Models ==={Style.RESET_ALL}\n")
    
    # Test OpenAI
    openai_client = initialize_openai()
    if openai_client:
        print(f"{Fore.GREEN}OpenAI Client Initialized Successfully{Style.RESET_ALL}")
        
        # Simple test
        try:
            response = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": "Say hello"}],
                max_tokens=10
            )
            print(f"OpenAI Test Response: {response.choices[0].message.content}")
        except Exception as e:
            print(f"{Fore.RED}OpenAI Test Failed: {str(e)}{Style.RESET_ALL}")
    else:
        print(f"{Fore.RED}OpenAI Client Not Available{Style.RESET_ALL}")
    
    # Test Local LLM
    local_llm_client = initialize_local_llm()
    if local_llm_client:
        print(f"{Fore.GREEN}Local LLM Client Initialized Successfully{Style.RESET_ALL}")
        
        # Check health
        health = local_llm_client.check_health()
        print(f"Local LLM Health: {health['status']}")
        
        # Simple test
        try:
            result = local_llm_client.generate_response("Say hello", max_tokens=10)
            print(f"Local LLM Test Response: {result['text']}")
        except Exception as e:
            print(f"{Fore.RED}Local LLM Test Failed: {str(e)}{Style.RESET_ALL}")
    else:
        print(f"{Fore.RED}Local LLM Client Not Available{Style.RESET_ALL}")

def main():
    parser = argparse.ArgumentParser(description='Test the hybrid chat system')
    parser.add_argument('--models', action='store_true', help='Test individual models')
    parser.add_argument('--hybrid', action='store_true', help='Test the full hybrid system')
    parser.add_argument('--all', action='store_true', help='Run all tests')
    
    args = parser.parse_args()
    
    # If no specific tests are requested, test all
    test_all = args.all or not (args.models or args.hybrid)
    
    if test_all or args.models:
        test_individual_models()
    
    if test_all or args.hybrid:
        test_full_hybrid_system()

if __name__ == "__main__":
    main()