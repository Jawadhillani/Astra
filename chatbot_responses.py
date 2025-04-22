# chatbot_responses.py
COMMON_RESPONSES = {
    "greetings": [
        "Hello! I'm your automotive assistant. How can I help you today?",
        "Hi there! What would you like to know about your BMW 3 Series?",
        "Greetings! I'm here to answer your car-related questions."
    ],
    "farewells": [
        "Goodbye! Feel free to chat again if you have more car questions.",
        "Take care! Let me know if you need help with your vehicle later.",
        "Bye for now! I'm here whenever you need automotive assistance."
    ]
}

def get_response_for_pattern(input_text):
    """Get predefined response for common patterns."""
    text = input_text.lower().strip()
    
    if text in ["hi", "hello", "hey", "hi there", "hello there"]:
        import random
        return random.choice(COMMON_RESPONSES["greetings"])
        
    if text in ["bye", "goodbye", "see you", "later"]:
        import random
        return random.choice(COMMON_RESPONSES["farewells"])
    
    return None  # No match