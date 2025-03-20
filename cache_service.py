# cache_service.py
import hashlib
import json
import time
from typing import Dict, Any, Optional
import threading
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CacheService:
    """Advanced caching service with TTL and auto-cleanup."""
    
    def __init__(self, ttl_seconds=3600):
        self.cache = {}
        self.ttl_seconds = ttl_seconds
        self.lock = threading.RLock()
        
        # Start background cleanup thread
        self.cleanup_thread = threading.Thread(target=self._cleanup_expired, daemon=True)
        self.cleanup_thread.start()
    
    def get(self, key: str) -> Optional[Dict[str, Any]]:
        """Get a value from the cache if it exists and is not expired."""
        with self.lock:
            if key not in self.cache:
                return None
                
            cache_item = self.cache[key]
            if time.time() > cache_item['expiry']:
                # Item has expired
                del self.cache[key]
                return None
                
            # Update access time
            cache_item['last_accessed'] = time.time()
            return cache_item['value']
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set a value in the cache with an optional custom TTL."""
        expiry = time.time() + (ttl if ttl is not None else self.ttl_seconds)
        
        with self.lock:
            self.cache[key] = {
                'value': value,
                'expiry': expiry,
                'last_accessed': time.time()
            }
            
        logger.debug(f"Cached item with key {key}")
    
    def delete(self, key: str) -> None:
        """Delete an item from the cache."""
        with self.lock:
            if key in self.cache:
                del self.cache[key]
                logger.debug(f"Deleted cached item with key {key}")
    
    def clear(self) -> None:
        """Clear all items from the cache."""
        with self.lock:
            self.cache.clear()
            logger.info("Cache cleared")
    
    def generate_key(self, prefix: str, **kwargs) -> str:
        """Generate a cache key from a prefix and keyword arguments."""
        # Sort kwargs to ensure consistent key generation
        sorted_items = sorted(kwargs.items())
        key_parts = [prefix]
        
        # Add each kwarg to the key
        for k, v in sorted_items:
            # Handle different types (str, int, dict, list)
            if isinstance(v, (dict, list)):
                v_str = json.dumps(v, sort_keys=True)
            else:
                v_str = str(v)
            key_parts.append(f"{k}:{v_str}")
        
        # Join with | as separator
        key_string = "|".join(key_parts)
        
        # Create MD5 hash for shorter keys
        key_hash = hashlib.md5(key_string.encode()).hexdigest()
        return f"{prefix}:{key_hash}"
    
    def _cleanup_expired(self) -> None:
        """Background thread to clean up expired cache items."""
        while True:
            try:
                with self.lock:
                    now = time.time()
                    expired_keys = [k for k, v in self.cache.items() if now > v['expiry']]
                    
                    for key in expired_keys:
                        del self.cache[key]
                        
                    if expired_keys:
                        logger.debug(f"Cleaned up {len(expired_keys)} expired cache items")
                
                # Sleep for a while before next cleanup
                time.sleep(300)  # Check every 5 minutes
            except Exception as e:
                logger.error(f"Error in cache cleanup: {str(e)}")
                time.sleep(60)  # Wait a bit before retrying