# automotive_system_message.py
"""
Module for generating specialized automotive system messages for LLM prompting.
This enhances response quality for car-related queries by providing domain-specific context.
"""

def create_automotive_system_message(car_data=None, available_cars=None):
    """
    Creates a specialized system message for automotive assistant.
    
    Args:
        car_data (dict, optional): Data about the specific car being discussed
        available_cars (list, optional): List of available cars in the database
        
    Returns:
        str: Formatted system message for the LLM
    """
    
    base_message = """You are an expert automotive assistant with specialized knowledge of cars, engines, 
features, and automotive technology. Your responses should be helpful, accurate, conversational, and confident.

INSTRUCTIONS:
1. Provide detailed, accurate information about vehicles when available.
2. When specific data isn't available, provide general information about similar vehicles in that class.
3. Balance technical accuracy with conversational tone, speaking naturally as an automotive expert would.
4. Use automotive terminology appropriately but explain technical terms when they might not be familiar.
5. If you're unsure about specific details, be honest but still provide helpful general information.
6. Respond to casual language and slang in a friendly manner.
7. When appropriate, suggest related aspects the user might be interested in.
8. Recognize sentiment in user messages and respond appropriately.

RESPONSE GUIDELINES:
- For technical specifications: Balance accuracy with practical implications.
- For comparisons: Highlight key differentiating factors objectively.
- For recommendations: Consider user context and needs.
- For problems/issues: Be honest about known issues while maintaining balance.
"""

    # Add specific car context if available
    if car_data:
        car_context = f"\nCURRENT VEHICLE CONTEXT:\nThe user is inquiring about a {car_data.get('year', '')} {car_data.get('manufacturer', '')} {car_data.get('model', '')}.\n"
        
        # Add known specifications
        specs = []
        if car_data.get('body_type'):
            specs.append(f"Body Type: {car_data['body_type']}")
        if car_data.get('engine_info'):
            specs.append(f"Engine: {car_data['engine_info']}")
        if car_data.get('transmission'):
            specs.append(f"Transmission: {car_data['transmission']}")
        if car_data.get('fuel_type'):
            specs.append(f"Fuel Type: {car_data['fuel_type']}")
        if car_data.get('mpg'):
            specs.append(f"Fuel Economy: {car_data['mpg']} MPG")
            
        # Include specs in context if we have them
        if specs:
            car_context += "Known specifications:\n- " + "\n- ".join(specs) + "\n"
            
        # Add manufacturer-specific guidance if we have any
        manufacturer = car_data.get('manufacturer', '').lower()
        if manufacturer in ['toyota', 'honda']:
            car_context += f"\nThis {manufacturer.title()} vehicle is known for reliability and efficiency. Consider highlighting these aspects when relevant.\n"
        elif manufacturer in ['bmw', 'mercedes', 'audi']:
            car_context += f"\nThis {manufacturer.title()} vehicle is a luxury brand focusing on performance and premium features. Consider highlighting these aspects when relevant.\n"
        elif manufacturer in ['ford', 'chevrolet', 'dodge']:
            car_context += f"\nThis {manufacturer.title()} vehicle is an American brand with a focus on value and practicality. The Dodge Dart specifically was a compact sedan produced from 2013-2016.\n"
            
        base_message += car_context

    # Add available cars if provided
    if available_cars and len(available_cars) > 0:
        cars_sample = available_cars[:10]  # Limit to 10 cars to avoid token bloat
        cars_context = "\nOTHER AVAILABLE VEHICLES IN DATABASE:\n"
        cars_context += "\n".join([f"- {car.get('year', '')} {car.get('manufacturer', '')} {car.get('model', '')}" for car in cars_sample])
        base_message += cars_context
        
    return base_message