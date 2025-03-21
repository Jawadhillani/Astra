# app/database.py
"""
This is a stub file that replaces the original SQLite-based database.py.
It provides empty implementations of functions that might be imported elsewhere,
but doesn't actually use SQLite.
"""

import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Loading database stub (SQLite has been removed)")

# Dummy function to maintain API compatibility
def get_db():
    """Stub for get_db function. Does nothing."""
    yield None