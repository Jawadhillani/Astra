# nlu_service.py
from typing import Dict, List, Tuple, Optional
import re
import spacy

# Initialize spaCy NLP model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    import os
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

class QueryAnalyzer:
    """Service for analyzing user queries to determine intent and entities."""
    
    def __init__(self):
        self.comparison_patterns = [
            r'\bcompare\b', r'\bvs\b', r'\bversus\b', r'\bagainst\b',
            r'\bbetter\b', r'\bdifference\b', r'\bdifferences\b'
        ]
        self.review_patterns = [
            r'\breview\b', r'\bopinion\b', r'\bexperience\b', r'\bthink\b',
            r'\blike\b', r'\bdislike\b', r'\bowner\b', r'\buser\b'
        ]
        self.specification_patterns = [
            r'\bspec\b', r'\bspecs\b', r'\bspecification\b', r'\bspecifications\b',
            r'\btechnical\b', r'\bfeature\b', r'\bfeatures\b', r'\bdetail\b', r'\bdetails\b'
        ]
        
    def analyze_query(self, query: str) -> Dict:
        """Analyze the user query to determine intent and extract entities."""
        query_info = {
            'original_query': query,
            'intent': self._detect_intent(query),
            'entities': self._extract_entities(query),
            'sentiment': self._extract_sentiment(query),
            'requires_car_data': self._requires_car_data(query),
            'requires_reviews': self._requires_reviews(query),
            'is_comparison': self._is_comparison_query(query),
            'specific_aspects': self._extract_specific_aspects(query)
        }
        
        return query_info
    
    def _detect_intent(self, query: str) -> str:
        """Detect the primary intent of the query."""
        query_lower = query.lower()
        
        # Check for comparison intent
        if self._is_comparison_query(query_lower):
            return "comparison"
            
        # Check for review-focused intent
        if any(re.search(pattern, query_lower) for pattern in self.review_patterns):
            return "reviews"
            
        # Check for specification intent
        if any(re.search(pattern, query_lower) for pattern in self.specification_patterns):
            return "specifications"
            
        # General information intent
        return "information"
    
    def _extract_entities(self, query: str) -> Dict:
        """Extract named entities from the query using spaCy."""
        doc = nlp(query)
        entities = {
            'manufacturers': [],
            'models': [],
            'years': [],
            'features': []
        }
        
        # Extract entities using spaCy
        for ent in doc.ents:
            if ent.label_ == "ORG":
                entities['manufacturers'].append(ent.text)
            elif ent.label_ == "DATE" and ent.text.isdigit() and len(ent.text) == 4:
                entities['years'].append(int(ent.text))
                
        # Extract car features
        feature_terms = [
            'engine', 'mpg', 'transmission', 'fuel', 'economy', 'horsepower',
            'hybrid', 'electric', 'gas', 'diesel', 'awd', 'fwd', 'rwd', '4wd'
        ]
        
        for term in feature_terms:
            if term in query.lower():
                entities['features'].append(term)
                
        return entities
    
    def _extract_sentiment(self, query: str) -> Optional[str]:
        """Extract sentiment direction from the query."""
        query_lower = query.lower()
        
        positive_terms = ['good', 'best', 'great', 'excellent', 'positive', 'recommended']
        negative_terms = ['bad', 'worst', 'problem', 'negative', 'issue', 'avoid']
        
        if any(term in query_lower for term in positive_terms):
            return "positive"
        elif any(term in query_lower for term in negative_terms):
            return "negative"
            
        return None
    
    def _requires_car_data(self, query: str) -> bool:
        """Determine if the query requires structured car data."""
        specification_terms = [
            'spec', 'specs', 'specification', 'specifications', 'technical',
            'feature', 'features', 'detail', 'details', 'mpg', 'engine',
            'transmission', 'fuel', 'horsepower'
        ]
        
        return any(term in query.lower() for term in specification_terms)
    
    def _requires_reviews(self, query: str) -> bool:
        """Determine if the query requires review data."""
        review_terms = [
            'review', 'opinion', 'experience', 'think', 'like', 'dislike',
            'owner', 'user', 'recommend', 'satisfaction', 'happy', 'unhappy',
            'problem', 'issue', 'reliable', 'reliability'
        ]
        
        return any(term in query.lower() for term in review_terms)
    
    def _is_comparison_query(self, query: str) -> bool:
        """Determine if the query is asking for a comparison."""
        return any(re.search(pattern, query.lower()) for pattern in self.comparison_patterns)
    
    def _extract_specific_aspects(self, query: str) -> List[str]:
        """Extract specific aspects of the car the user is asking about."""
        aspects = []
        aspect_terms = {
            'performance': ['performance', 'speed', 'acceleration', 'handling', 'drive'],
            'reliability': ['reliability', 'reliable', 'dependable', 'durable', 'longevity'],
            'fuel_economy': ['fuel', 'economy', 'mpg', 'mileage', 'efficient', 'efficiency'],
            'comfort': ['comfort', 'comfortable', 'interior', 'seats', 'space', 'roominess'],
            'technology': ['tech', 'technology', 'infotainment', 'features', 'connectivity'],
            'safety': ['safety', 'safe', 'crash', 'protection', 'airbag', 'assist'],
            'value': ['value', 'price', 'cost', 'expensive', 'affordable', 'worth']
        }
        
        query_lower = query.lower()
        for aspect, terms in aspect_terms.items():
            if any(term in query_lower for term in terms):
                aspects.append(aspect)
                
        return aspects