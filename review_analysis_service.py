# app/review_analysis_service.py
import re
import logging
from typing import List, Dict, Any, Tuple
from collections import Counter

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ReviewAnalysisService:
    """Service for analyzing review text to extract insights."""
    
    def __init__(self):
        # Common terms that indicate positive aspects
        self.positive_terms = [
            'comfortable', 'reliable', 'spacious', 'powerful', 'efficient',
            'quiet', 'smooth', 'luxurious', 'responsive', 'quality',
            'stylish', 'affordable', 'economical', 'safety', 'technology',
            'fast', 'fun', 'excellent', 'great', 'good', 'love', 'best',
            'perfect', 'premium', 'impressed', 'amazing', 'solid', 'well-built',
            'handles', 'value', 'recommend'
        ]
        
        # Common terms that indicate negative aspects
        self.negative_terms = [
            'uncomfortable', 'unreliable', 'cramped', 'underpowered', 'inefficient',
            'noisy', 'rough', 'cheap', 'slow', 'poor', 'ugly', 'expensive',
            'costly', 'unsafe', 'outdated', 'disappointing', 'bad', 'worst',
            'terrible', 'awful', 'hate', 'dislike', 'problem', 'issue',
            'break', 'broken', 'fails', 'avoid', 'regret', 'money', 'repair'
        ]
        
        # Common categories for car reviews
        self.categories = {
            'performance': ['acceleration', 'power', 'engine', 'speed', 'horsepower', 'torque', 'handling', 'braking', 'performance'],
            'comfort': ['seat', 'comfort', 'quiet', 'noise', 'ride', 'cabin', 'interior', 'spacious', 'room', 'legroom'],
            'reliability': ['reliable', 'dependable', 'durable', 'problem', 'issue', 'repair', 'maintenance', 'breakdown', 'quality'],
            'fuel_economy': ['mpg', 'mileage', 'fuel', 'gas', 'economy', 'efficient', 'consumption', 'tank', 'range'],
            'value': ['price', 'cost', 'value', 'worth', 'money', 'expensive', 'cheap', 'affordable', 'budget'],
            'tech_features': ['feature', 'technology', 'tech', 'infotainment', 'screen', 'interface', 'connectivity', 'software', 'audio'],
            'styling': ['design', 'look', 'style', 'appearance', 'exterior', 'color', 'beautiful', 'attractive', 'ugly'],
            'safety': ['safety', 'safe', 'crash', 'airbag', 'assist', 'emergency', 'brake', 'collision', 'warning']
        }
    
    def analyze_reviews(self, reviews: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze a list of reviews to extract insights.
        
        Args:
            reviews: List of review dictionaries with 'text', 'rating', etc.
            
        Returns:
            Dictionary containing analysis results.
        """
        if not reviews:
            return {
                'average_rating': None,
                'sentiment': {'positive': 0, 'negative': 0, 'neutral': 0},
                'common_pros': [],
                'common_cons': [],
                'category_scores': {}
            }
        
        # Calculate average rating
        ratings = [review.get('rating', 0) for review in reviews if review.get('rating') is not None]
        avg_rating = sum(ratings) / len(ratings) if ratings else None
        
        # Extract pros and cons
        all_text = ' '.join([review.get('text', '') or review.get('review_text', '') for review in reviews])
        pros, cons = self._extract_pros_cons(all_text, reviews)
        
        # Calculate sentiment distribution
        sentiment = self._calculate_sentiment(reviews)
        
        # Calculate category scores
        category_scores = self._calculate_category_scores(reviews)
        
        return {
            'average_rating': avg_rating,
            'sentiment': sentiment,
            'common_pros': pros,
            'common_cons': cons,
            'category_scores': category_scores
        }
    
    def _extract_pros_cons(self, all_text: str, reviews: List[Dict[str, Any]]) -> Tuple[List[str], List[str]]:
        """Extract common pros and cons from review text."""
        # Initialize counters for potential pros and cons
        pro_counter = Counter()
        con_counter = Counter()
        
        # Search for explicit pros/cons sections
        explicit_pros = []
        explicit_cons = []
        
        for review in reviews:
            text = review.get('text', '') or review.get('review_text', '')
            if not text:
                continue
                
            text_lower = text.lower()
            
            # Look for structured pros/cons sections
            pro_section_match = re.search(r'pros?[:;-]\s*(.*?)(?=cons?[:;-]|$)', text_lower, re.DOTALL)
            con_section_match = re.search(r'cons?[:;-]\s*(.*?)(?=$)', text_lower, re.DOTALL)
            
            # Extract pros from structured section
            if pro_section_match:
                pro_section = pro_section_match.group(1).strip()
                # Split by bullet points, dashes, or new lines
                section_items = re.split(r'•|-|\n', pro_section)
                for item in section_items:
                    item = item.strip()
                    if item and len(item) > 3:  # Ignore very short items
                        explicit_pros.append(item)
            
            # Extract cons from structured section
            if con_section_match:
                con_section = con_section_match.group(1).strip()
                # Split by bullet points, dashes, or new lines
                section_items = re.split(r'•|-|\n', con_section)
                for item in section_items:
                    item = item.strip()
                    if item and len(item) > 3:  # Ignore very short items
                        explicit_cons.append(item)
            
            # Also identify potential pros/cons based on positive/negative terms
            words = text_lower.split()
            for i, word in enumerate(words):
                # Check for positive terms
                if word in self.positive_terms:
                    # Try to find the subject of the positive term
                    start_idx = max(0, i - 5)
                    end_idx = min(len(words), i + 5)
                    context = ' '.join(words[start_idx:end_idx])
                    
                    # Check which category this positive term relates to
                    for category, terms in self.categories.items():
                        if any(term in context for term in terms):
                            pro_counter[f"{category} ({word})"] += 1
                            break
                
                # Check for negative terms
                if word in self.negative_terms:
                    # Try to find the subject of the negative term
                    start_idx = max(0, i - 5)
                    end_idx = min(len(words), i + 5)
                    context = ' '.join(words[start_idx:end_idx])
                    
                    # Check which category this negative term relates to
                    for category, terms in self.categories.items():
                        if any(term in context for term in terms):
                            con_counter[f"{category} ({word})"] += 1
                            break
        
        # Combine explicit and implicit pros/cons
        final_pros = []
        final_cons = []
        
        # Add explicit pros (those directly mentioned in pros/cons sections)
        for pro in explicit_pros[:5]:  # Limit to top 5
            if len(pro) > 3 and pro not in final_pros:
                final_pros.append(pro.capitalize())
        
        # Add implicit pros (those derived from positive terms analysis)
        for pro, count in pro_counter.most_common(5):
            # Convert "category (term)" format to more natural language
            category, term = re.match(r'(\w+) \((\w+)\)', pro).groups()
            natural_pro = self._convert_to_natural_language(category, term, True)
            if natural_pro and natural_pro not in final_pros:
                final_pros.append(natural_pro)
        
        # Add explicit cons
        for con in explicit_cons[:5]:  # Limit to top 5
            if len(con) > 3 and con not in final_cons:
                final_cons.append(con.capitalize())
        
        # Add implicit cons
        for con, count in con_counter.most_common(5):
            # Convert "category (term)" format to more natural language
            category, term = re.match(r'(\w+) \((\w+)\)', con).groups()
            natural_con = self._convert_to_natural_language(category, term, False)
            if natural_con and natural_con not in final_cons:
                final_cons.append(natural_con)
        
        # Limit to 5 of each
        return final_pros[:5], final_cons[:5]
    
    def _convert_to_natural_language(self, category: str, term: str, is_positive: bool) -> str:
        """Convert a category and term to natural language pros/cons."""
        if category == 'performance' and is_positive:
            return f"Excellent performance and {term} driving experience"
        elif category == 'performance' and not is_positive:
            return f"Disappointing performance and {term} issues"
        elif category == 'comfort' and is_positive:
            return f"Very comfortable with {term} interior"
        elif category == 'comfort' and not is_positive:
            return f"Uncomfortable {term} and cabin experience"
        elif category == 'reliability' and is_positive:
            return f"Highly reliable and {term}"
        elif category == 'reliability' and not is_positive:
            return f"Reliability concerns with {term} issues"
        elif category == 'fuel_economy' and is_positive:
            return f"Excellent fuel economy and {term} efficiency"
        elif category == 'fuel_economy' and not is_positive:
            return f"Poor fuel economy and {term} consumption"
        elif category == 'value' and is_positive:
            return f"Great value for the {term}"
        elif category == 'value' and not is_positive:
            return f"Overpriced for what you get ({term})"
        elif category == 'tech_features' and is_positive:
            return f"Impressive technology and {term} features"
        elif category == 'tech_features' and not is_positive:
            return f"Outdated or problematic {term} features"
        elif category == 'styling' and is_positive:
            return f"Attractive {term} and styling"