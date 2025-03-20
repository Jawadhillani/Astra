# app/database.py
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import logging
import os

# Import Base from base.py
from app.base import Base

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres.srzcxykhrysxwpyxmlzy:8M1X4lkh41GTR!@aws-0-us-west-1.pooler.supabase.com:6543/postgres")
using_fallback = False

try:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        echo=True,
        connect_args={"sslmode": "require"}
    )
    
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
        logger.info("Successfully connected to database")
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
except Exception as e:
    logger.error(f"Error connecting to primary database: {str(e)}")
    logger.info("Switching to SQLite fallback database")
    
    # Delay model imports until after Base is defined
    from app.models.car import Car
    
    sqlite_url = "sqlite:///./astra_cars.db"
    engine = create_engine(sqlite_url, echo=True, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    using_fallback = True
    
    # Initialize fallback
    Base.metadata.create_all(bind=engine)
    logger.info(f"Using fallback database: {sqlite_url}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()