# query_classifier.py
"""
Module for classifying user queries to determine intent and routing.
This helps determine which model should handle which types of queries.
"""

import re
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class QueryClassifier:
    """
    Classifies user queries to determine intent and appropriate handling strategy.
    Used for routing between models and tailoring response generation.
    """
    
    def __init__(self):
        # Define patterns for different query types
        self.patterns = {
            # Conversational patterns
            "greeting": r"\b(hello|hi|hey|greetings|good morning|good afternoon|good evening|how are you|how r u|how's it going|what's up|sup)\b",
            "farewell": r"\b(bye|goodbye|see you|later|farewell)\b",
            "gratitude": r"\b(thanks|thank you|appreciate|grateful)\b",
            "sentiment": r"\b(like|love|hate|enjoy|dislike)\b",
            "insult": r"\b(dumb|stupid|useless|bad|awful|sucks)\b",
            "praise": r"\b(great|awesome|excellent|cool|nice|good|helpful)\b",
            
            # Automotive-specific patterns
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
            "opinion": r"\b(what.+think|your opinion|rate|review|thoughts)\b",
        }
        
        # Define categories for routing decisions
        self.category_mapping = {
            # Categories that should use the local model (automotive-specific)
            "automotive_specific": [
                "features", "specs", "fuel_economy", "performance", 
                "safety", "interior", "exterior", "reliability",
                "comparison", "technology"
            ],
            
            # Categories that can use either model but prefer local for automotive context
            "automotive_contextual": [
                "recommendation", "opinion", "price"
            ],
            
            # Categories that should use OpenAI (conversational, complex reasoning)
            "conversational": [
                "greeting", "farewell", "gratitude", "sentiment", 
                "insult", "praise"
            ]
        }
        
    def classify(self, query: str, car_data: Any = None) -> Dict[str, Any]:
        """
        Classify a user query to determine intent and routing.
        
        Args:
            query: The user query to classify
            car_data: Optional car data for additional context
            
        Returns:
            Dictionary with classification results
        """
        if not query:
            return {
                "query_types": ["general"],
                "routing_category": "conversational",
                "is_automotive_specific": False,
                "is_conversational": True,
                "confidence": 0.5
            }
        
        # Lowercase for pattern matching
        query_lower = query.lower()
        
        # Check patterns
        matched_types = []
        for query_type, pattern in self.patterns.items():
            if re.search(pattern, query_lower):
                matched_types.append(query_type)
                
        # Default to general if no patterns match
        if not matched_types:
            matched_types = ["general"]
            
        # Determine routing category
        routing_category = self._determine_routing_category(matched_types)
        
        # Calculate confidence based on match strength and query complexity
        confidence = self._calculate_confidence(matched_types, query)
        
        return {
            "query_types": matched_types,
            "routing_category": routing_category,
            "is_automotive_specific": any(t in self.category_mapping["automotive_specific"] for t in matched_types),
            "is_conversational": any(t in self.category_mapping["conversational"] for t in matched_types),
            "confidence": confidence
        }
        
    def _determine_routing_category(self, matched_types: List[str]) -> str:
        """
        Determine which category this query belongs to for routing purposes.
        
        Args:
            matched_types: List of matched query types
            
        Returns:
            Routing category (automotive_specific, automotive_contextual, or conversational)
        """
        # Check if any automotive_specific types are matched
        if any(t in self.category_mapping["automotive_specific"] for t in matched_types):
            return "automotive_specific"
            
        # Check if any automotive_contextual types are matched
        if any(t in self.category_mapping["automotive_contextual"] for t in matched_types):
            return "automotive_contextual"
            
        # Default to conversational
        return "conversational"
        
    def _calculate_confidence(self, matched_types: List[str], query: str) -> float:
        """
        Calculate confidence in the classification.
        
        Args:
            matched_types: List of matched query types
            query: Original query
            
        Returns:
            Confidence score (0.0 to 1.0)
        """
        # Base confidence starts at 0.5
        confidence = 0.5
        
        # More matches increases confidence
        if len(matched_types) > 1:
            confidence += 0.1 * min(len(matched_types), 3)  # Cap at +0.3
            
        # Longer queries typically provide more context
        query_length = len(query.split())
        if query_length > 5:
            confidence += 0.1  # More confident with longer queries
            
        # Very short queries are less confident unless they're simple greetings
        if query_length < 3 and not any(t in ["greeting", "farewell"] for t in matched_types):
            confidence -= 0.1
            
        # Cap confidence between 0.1 and 0.9
        return max(0.1, min(0.9, confidence))