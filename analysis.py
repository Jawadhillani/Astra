from typing import List
from app.models.review import Review
import statistics

def analyze_reviews(reviews: List[Review]):
    if not reviews:
        return {
            "average_rating": 0,
            "total_reviews": 0,
            "sentiment": {"positive": 0, "negative": 0, "neutral": 0},
            "common_topics": []
        }

    ratings = [r.rating for r in reviews]
    
    # Basic statistics
    analysis = {
        "average_rating": statistics.mean(ratings),
        "total_reviews": len(reviews),
        "sentiment": {
            "positive": len([r for r in reviews if r.rating >= 4]),
            "negative": len([r for r in reviews if r.rating <= 2]),
            "neutral": len([r for r in reviews if 2 < r.rating < 4])
        }
    }
    
    # Simple topic extraction (we'll enhance this with AI later)
    common_words = {}
    for review in reviews:
        words = review.review_text.lower().split()
        for word in words:
            if len(word) > 3:  # Skip short words
                common_words[word] = common_words.get(word, 0) + 1
    
    analysis["common_topics"] = sorted(
        common_words.items(), 
        key=lambda x: x[1], 
        reverse=True
    )[:10]
    
    return analysis