from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from app.base import Base
class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    car_id = Column(Integer, ForeignKey("cars.id"))
    author = Column(String)
    review_title = Column(String)
    review_text = Column(String)
    rating = Column(Float)
    review_date = Column(DateTime)
    is_ai_generated = Column(Boolean, default=False)
