# response_analyzer.py
"""
Module for analyzing LLM responses to extract structured data.
This helps with visualizing information and providing UI enhancements.
"""

import re
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

class ResponseAnalyzer:
    """
    Analyzes LLM text responses to extract structured information like:
    - Pros and cons
    - Sentiment
    - Ratings
    - Vehicle specifications
    - Feature comparisons
    """
    
    def __init__(self):
        # Define patterns for extracting information
        self.pros_pattern = r"(?:pros|advantages|benefits|strengths)[:\s]+(?:\n*(?:[-•*]\s*|\d+\.\s*)(.*?)(?:\n|$))+"
        self.cons_pattern = r"(?:cons|disadvantages|drawbacks|limitations)[:\s]+(?:\n*(?:[-•*]\s*|\d+\.\s*)(.*?)(?:\n|$))+"
        self.rating_pattern = r"(\d+(\.\d+)?)\s*(?:out of|\/)\s*5"
        self.spec_pattern = r"(?:specification|specs?)[:\s]+(?:\n*(?:[-•*]\s*|\d+\.\s*)(.*?)(?:\n|$))+"
        
        # Keywords for sentiment analysis
        self.positive_keywords = [
            "excellent", "great", "good", "reliable", "recommend", "impressive", 
            "best", "love", "enjoy", "pleased", "quality", "smooth", "solid", 
            "perfect", "innovative", "comfortable", "efficient", "powerful"
        ]
        
        self.negative_keywords = [
            "poor", "bad", "avoid", "issue", "problem", "disappointing", "worst", 
            "dislike", "terrible", "unimpressed", "lacking", "cheap", "underwhelming",
            "inefficient", "uncomfortable", "noisy", "unreliable", "weak"
        ]
    
    def analyze(self, response_text: str, car_data: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Analyze the response text to extract structured information.
        
        Args:
            response_text: The LLM response text to analyze
            car_data: Optional car data for context
            
        Returns:
            Dictionary containing analysis results
        """
        if not response_text:
            return {
                "sentiment": {"positive": 0, "negative": 0, "neutral": 1},
                "common_pros": [],
                "common_cons": [],
                "has_rating": False,
                "rating": None,
                "specs_mentioned": []
            }
        
        analysis = {
            "sentiment": self._analyze_sentiment(response_text),
            "common_pros": self._extract_pros(response_text),
            "common_cons": self._extract_cons(response_text),
            "specs_mentioned": self._extract_specs_mentioned(response_text, car_data),
        }
        
        # Extract rating if present
        rating = self._extract_rating(response_text)
        analysis["has_rating"] = rating is not None
        analysis["rating"] = rating
        
        return analysis
    
    def _extract_pros(self, text: str) -> List[str]:
        """Extract pros/advantages from the response text."""
        return self._extract_bullet_points(text, self.pros_pattern)
    
    def _extract_cons(self, text: str) -> List[str]:
        """Extract cons/disadvantages from the response text."""
        return self._extract_bullet_points(text, self.cons_pattern)
    
    def _extract_bullet_points(self, text: str, pattern: str) -> List[str]:
        """
        Generic method to extract bullet points matching a pattern.
        
        Args:
            text: Text to extract from
            pattern: Regex pattern to match section
            
        Returns:
            List of extracted points
        """
        points = []
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        
        if match:
            section = match.group(0)
            # Look for bullet points, numbered lists, or simple newlines
            items = re.findall(r"[-•*]\s*(.*?)(?:\n|$)|\d+\.\s*(.*?)(?:\n|$)", section)
            
            for item in items:
                # Items might be in first or second capture group
                point = item[0] or item[1]
                if point and len(point.strip()) > 0:
                    points.append(point.strip())
                    
        return points
    
    def _extract_rating(self, text: str) -> Optional[float]:
        """Extract numerical rating from the text if present."""
        match = re.search(self.rating_pattern, text, re.IGNORECASE)
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                logger.warning(f"Failed to parse rating value: {match.group(1)}")
        return None
    
    def _analyze_sentiment(self, text: str) -> Dict[str, int]:
        """
        Perform simple keyword-based sentiment analysis.
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary with counts of positive, negative, and neutral sentiment
        """
        sentiment = {"positive": 0, "negative": 0, "neutral": 0}
        
        # Count positive keywords
        for keyword in self.positive_keywords:
            sentiment["positive"] += len(re.findall(r"\b" + re.escape(keyword) + r"\b", text, re.IGNORECASE))
            
        # Count negative keywords
        for keyword in self.negative_keywords:
            sentiment["negative"] += len(re.findall(r"\b" + re.escape(keyword) + r"\b", text, re.IGNORECASE))
            
        # If no sentiment detected, count as neutral
        if sentiment["positive"] == 0 and sentiment["negative"] == 0:
            sentiment["neutral"] = 1
        
        return sentiment
    
    def _extract_specs_mentioned(self, text: str, car_data: Optional[Dict]) -> List[str]:
        """
        Extract which specifications were mentioned in the response.
        
        Args:
            text: Response text to analyze
            car_data: Optional car data for context
            
        Returns:
            List of specification keys mentioned
        """
        specs_mentioned = []
        
        if not car_data:
            return specs_mentioned
            
        # Check for mentions of known specifications
        spec_keywords = {
            "engine": ["engine", "motor", "powertrain", "horsepower", "hp", "cylinder"],
            "transmission": ["transmission", "gearbox", "manual", "automatic", "cvt", "dct"],
            "body_type": ["body", "sedan", "suv", "coupe", "hatchback", "wagon"],
            "fuel_type": ["fuel", "gas", "gasoline", "diesel", "electric", "hybrid"],
            "mpg": ["mpg", "mileage", "fuel economy", "efficiency", "gas mileage"],
        }
        
        for spec_key, keywords in spec_keywords.items():
            if any(keyword in text.lower() for keyword in keywords):
                specs_mentioned.append(spec_key)
                
        return specs_mentioned