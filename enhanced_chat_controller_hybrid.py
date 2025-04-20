# enhanced_chat_controller.py
"""
Enhanced ChatController that leverages the hybrid model router.
This serves as the main entry point for the chat API.
"""

from fastapi import APIRouter, HTTPException, Body, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import logging
import time
import json
import os
from datetime import datetime

# Import our new components with proper relative imports
from .model_router import ModelRouter
from .automotive_system_message import create_automotive_system_message
from .query_classifier import QueryClassifier
from .response_analyzer import ResponseAnalyzer
from .local_llm_client import LocalLLMClient

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize OpenAI client
try:
    from openai import OpenAI
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        openai_client = OpenAI(api_key=openai_api_key)
        logger.info("Successfully initialized OpenAI client")
    else:
        openai_client = None
        logger.warning("OPENAI_API_KEY not found in environment variables")
except ImportError:
    openai_client = None
    logger.warning("openai package not installed, some features will be unavailable")

# Initialize local LLM client
try:
    local_llm_client = LocalLLMClient()
    local_health = local_llm_client.check_health()
    if local_health["status"] == "online":
        logger.info("Successfully initialized local LLM client")
    else:
        local_llm_client = None
        logger.warning(f"Local LLM health check failed: {local_health}")
except Exception as e:
    local_llm_client = None
    logger.warning(f"Could not initialize Local LLM client: {str(e)}")

# Initialize router with both models
model_router = ModelRouter(openai_client, local_llm_client)

# Simple in-memory conversation history
class ConversationHistory:
    def __init__(self):
        self.history = {}
    
    def get_history(self, user_id: str, limit: int = None):
        """Get conversation history for a user with optional limit."""
        if user_id not in self.history:
            self.history[user_id] = []
        return self.history[user_id][-limit:] if limit else self.history[user_id]
    
    def add_exchange(self, user_id: str, user_message: str, ai_response: str):
        """Add a message exchange to the conversation history."""
        if user_id not in self.history:
            self.history[user_id] = []
        
        self.history[user_id].append({
            "user": user_message,
            "ai": ai_response,
            "timestamp": datetime.now().isoformat()
        })
        
        # Keep history at a reasonable size (last 20 messages)
        if len(self.history[user_id]) > 20:
            self.history[user_id] = self.history[user_id][-20:]
        
        return True

# Initialize conversation manager
conversation_manager = ConversationHistory()

# Request model for chat
class ChatRequest(BaseModel):
    message: str
    car_id: Optional[int] = None
    user_id: str = "default_user"
    conversation_history: Optional[List[str]] = None
    force_model: Optional[str] = None  # 'openai', 'local', or None
    
# Response model for chat
class ChatResponse(BaseModel):
    response: str
    model_used: Optional[str] = None
    confidence: Optional[float] = None
    query_types: Optional[List[str]] = None
    response_time: Optional[float] = None
    analysis: Optional[Dict[str, Any]] = None

@router.post("/api/chat", response_model=ChatResponse)
async def process_chat(request: ChatRequest):
    """
    Process a chat request and generate a response using the appropriate model.
    
    Args:
        request: Chat request with message and context
        
    Returns:
        Chat response with generated text and metadata
    """
    start_time = time.time()
    
    try:
        # Extract fields from request
        message = request.message
        car_id = request.car_id
        user_id = request.user_id
        conversation_history = request.conversation_history or []
        
        logger.info(f"Received chat request: message='{message}', car_id={car_id}")
        
        # Check if model forcing is requested
        if request.force_model:
            model_router.set_force_model(request.force_model)
        else:
            model_router.set_force_model(None)
        
        # Get car data if car_id provided
        car_data = None
        if car_id:
            try:
                from app.supabase_service import get_car_by_id
                car_data = get_car_by_id(car_id)
                logger.info(f"Retrieved car data: {car_data}")
            except Exception as e:
                logger.warning(f"Could not get car data: {str(e)}")
        
        # Exit early if message is empty
        if not message:
            return ChatResponse(
                response="I'm not sure what you're asking. Can you provide more details?",
                model_used="rule",
                confidence=1.0,
                query_types=["empty"],
                response_time=time.time() - start_time
            )
        
        # Process conversation history to flat list for router
        flat_history = []
        if conversation_history:
            flat_history = conversation_history
        else:
            # Get from our conversation manager
            exchanges = conversation_manager.get_history(user_id, limit=10)
            for exchange in exchanges:
                flat_history.append(exchange["user"])
                flat_history.append(exchange["ai"])
        
        # Route the query to the appropriate model
        result = model_router.route_query(
            query=message,
            car_data=car_data,
            conversation_history=flat_history
        )
        
        # Add exchange to conversation history
        conversation_manager.add_exchange(user_id, message, result["response"])
        
        # Return response with metadata
        return ChatResponse(
            response=result["response"],
            model_used=result["model_used"],
            confidence=result["confidence"],
            query_types=result["query_types"],
            response_time=result["response_time"],
            analysis=result["analysis"]
        )
        
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        
        # If it's a timeout or rate limit issue
        if "timeout" in str(e).lower() or "rate" in str(e).lower():
            raise HTTPException(
                status_code=503,
                detail="Service temporarily unavailable. Please try again shortly."
            )
        
        # For other errors, return a generic error message
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while processing your request: {str(e)}"
        )

@router.get("/api/chat/metrics")
async def get_metrics():
    """Get metrics about the chat system."""
    return {
        "metrics": model_router.get_metrics(),
        "status": "operational",
        "models": {
            "openai": openai_client is not None,
            "local": local_llm_client is not None,
            "local_health": local_llm_client.check_health() if local_llm_client else None
        }
    }

@router.post("/api/chat/set_model")
async def set_model(model_name: str = Body(..., embed=True)):
    """Force a specific model for testing/demos."""
    try:
        model_router.set_force_model(model_name)
        return {"message": f"Model set to {model_name}"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))