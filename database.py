from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import logging
import os

# Import your Car model
from app.models.car import Car

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Base declarative class
Base = declarative_base()

# Try to use environment variable for database URL, or fall back to default
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres.srzcxykhrysxwpyxmlzy:8M1X4lkh41GTR!@aws-0-us-west-1.pooler.supabase.com:6543/postgres")

# Flag to track if we're using the fallback database
using_fallback = False

try:
    # Try connecting to the primary database
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        echo=True,
        connect_args={"sslmode": "require"}
    )
    
    # Test the connection
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
        logger.info("Successfully connected to database")
    
    # Create session factory
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
except Exception as e:
    logger.error(f"Error connecting to primary database: {str(e)}")
    logger.info("Switching to SQLite fallback database for development")
    
    # Use SQLite as fallback
    sqlite_url = "sqlite:///./astra_cars.db"
    engine = create_engine(sqlite_url, echo=True, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    using_fallback = True
    logger.info(f"Using fallback database: {sqlite_url}")

    # Initialize fallback database structure and data
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Created tables in fallback database")
        
        # Seed initial data if empty
        db = SessionLocal()
        if db.query(Car).count() == 0:
            logger.info("Seeding fallback database with essential cars")
            
            # Add your core cars here
            default_cars = [
                Car(
                    manufacturer="Tesla",
                    model="Model 3",
                    year=2023,
                    body_type="Sedan",
                    engine_info="Electric",
                    transmission="Automatic",
                    fuel_type="Electric",
                    mpg=134
                ),
                Car(
                    manufacturer="BMW",
                    model="M3",
                    year=2023,
                    body_type="Coupe",
                    engine_info="3.0L Twin-Turbo I6",
                    transmission="Automatic",
                    fuel_type="Gasoline",
                    mpg=23
                ),
                # Add more essential cars as needed
            ]
            
            db.bulk_save_objects(default_cars)
            db.commit()
            logger.info(f"Added {len(default_cars)} core cars to fallback database")
            
    except Exception as e:
        logger.error(f"Error initializing fallback database: {str(e)}")
    finally:
        db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Create database tables if they don't exist."""
    if using_fallback:
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Created tables in fallback database")
        except Exception as e:
            logger.error(f"Error creating tables: {str(e)}")