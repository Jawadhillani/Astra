# data_service.py
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
import re
from typing import Dict, List, Optional, Tuple
from app.models.car import Car
from app.models.review import Review

class CarDataService:
    """Service for retrieving comprehensive car data."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_car_by_id(self, car_id: int) -> Optional[Dict]:
        """Retrieve detailed car information by ID with all specifications."""
        car = self.db.query(Car).filter(Car.id == car_id).first()
        if not car:
            return None
            
        return self._format_car_data(car)
    
    def search_cars_by_query(self, query: str, limit: int = 3) -> List[Dict]:
        """Intelligent search for cars based on natural language query."""
        # Extract potential car identifiers from query
        manufacturer_terms = self._extract_manufacturer_terms(query)
        model_terms = self._extract_model_terms(query)
        year_terms = self._extract_year_terms(query)
        
        # Build search filters
        filters = []
        if manufacturer_terms:
            manufacturer_filter = or_(*[func.lower(Car.manufacturer).contains(term.lower()) for term in manufacturer_terms])
            filters.append(manufacturer_filter)
            
        if model_terms:
            model_filter = or_(*[func.lower(Car.model).contains(term.lower()) for term in model_terms])
            filters.append(model_filter)
            
        if year_terms:
            year_filter = or_(*[Car.year == year for year in year_terms])
            filters.append(year_filter)
        
        # If no specific filters, perform generic search
        if not filters:
            search_terms = [term for term in query.split() if len(term) > 2]
            combined_filter = or_(
                *[func.lower(Car.manufacturer).contains(term.lower()) for term in search_terms],
                *[func.lower(Car.model).contains(term.lower()) for term in search_terms],
                *[func.lower(Car.body_type).contains(term.lower()) for term in search_terms],
                *[func.lower(Car.engine_info).contains(term.lower()) for term in search_terms],
                *[func.lower(Car.fuel_type).contains(term.lower()) for term in search_terms]
            )
            filters.append(combined_filter)
        
        # Execute search
        cars = self.db.query(Car).filter(and_(*filters)).limit(limit).all()
        return [self._format_car_data(car) for car in cars]
    
    def get_reviews(self, car_id: int, limit: int = 5, sentiment: Optional[str] = None) -> List[Dict]:
        """Get reviews for a specific car with optional sentiment filtering."""
        query = self.db.query(Review).filter(Review.car_id == car_id)
        
        # Apply sentiment filtering if specified
        if sentiment == "positive":
            query = query.filter(Review.rating >= 4)
        elif sentiment == "negative":
            query = query.filter(Review.rating <= 2)
        
        # Sort by relevance (rating) and recency
        query = query.order_by(Review.rating.desc(), Review.review_date.desc())
        
        reviews = query.limit(limit).all()
        return [self._format_review_data(review) for review in reviews]
    
    def get_car_comparison(self, car_id1: int, car_id2: int) -> Tuple[Dict, Dict]:
        """Retrieve comprehensive data for comparing two cars."""
        car1 = self.get_car_by_id(car_id1)
        car2 = self.get_car_by_id(car_id2)
        return car1, car2
    
    def _format_car_data(self, car) -> Dict:
        """Convert a car model to a detailed dictionary with all specifications."""
        return {
            'id': car.id,
            'manufacturer': car.manufacturer,
            'model': car.model,
            'year': car.year,
            'body_type': car.body_type,
            'engine_info': car.engine_info,
            'transmission': car.transmission,
            'fuel_type': car.fuel_type,
            'mpg': car.mpg,
            'specifications': {
                'id': car.id,
                'manufacturer': car.manufacturer,
                'model': car.model,
                'year': car.year,
                'body_type': car.body_type,
                'engine_info': car.engine_info,
                'transmission': car.transmission,
                'fuel_type': car.fuel_type,
                'mpg': car.mpg
            }
        }
    
    def _format_review_data(self, review) -> Dict:
        """Convert a review model to a dictionary with all relevant fields."""
        return {
            'id': review.id,
            'car_id': review.car_id,
            'author': review.author,
            'title': review.review_title,
            'text': review.review_text,
            'rating': review.rating,
            'date': review.review_date.isoformat() if review.review_date else None,
            'is_ai_generated': review.is_ai_generated
        }
    
    def _extract_manufacturer_terms(self, query: str) -> List[str]:
        """Extract potential manufacturer names from query."""
        common_manufacturers = ['toyota', 'honda', 'ford', 'chevrolet', 'bmw', 'audi', 'mercedes', 'tesla']
        found_terms = []
        
        for manufacturer in common_manufacturers:
            if manufacturer.lower() in query.lower():
                found_terms.append(manufacturer)
                
        return found_terms
    
    def _extract_model_terms(self, query: str) -> List[str]:
        """Extract potential model names from query."""
        # This would be more sophisticated in production
        words = query.split()
        # Filter words that are likely model names (capitalized, alphanumeric, etc.)
        return [word for word in words if len(word) > 2 and not word.lower() in ['car', 'vehicle', 'about', 'the']]
    
    def _extract_year_terms(self, query: str) -> List[int]:
        """Extract potential year mentions from query."""
        year_pattern = r'\b(19|20)\d{2}\b'  # Match years from 1900-2099
        matches = re.findall(year_pattern, query)
        return [int(year) for year in matches]
    