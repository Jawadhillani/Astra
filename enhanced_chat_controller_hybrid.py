# enhanced_chat_controller_hybrid.py
"""
Enhanced ChatController that leverages the hybrid model router.
This serves as the main entry point for the chat API.
"""

import os
from dotenv import load_dotenv
import pathlib
from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import logging
import time
import json
from datetime import datetime

# Load environment variables
load_dotenv()
parent_env = pathlib.Path(__file__).parent.parent.parent / '.env'
if parent_env.exists():
    load_dotenv(dotenv_path=parent_env)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Check OpenAI API key
openai_api_key = os.getenv("OPENAI_API_KEY")
if openai_api_key:
    logger.info("Successfully loaded OpenAI API key")
else:
    logger.warning("OPENAI_API_KEY not found in environment variables")

# Import our new components with proper relative imports
from .model_router import ModelRouter
from .automotive_system_message import create_automotive_system_message
from .query_classifier import QueryClassifier
from .response_analyzer import ResponseAnalyzer
from .local_llm_client import LocalLLMClient

router = APIRouter()

# Initialize OpenAI client
try:
    from openai import OpenAI
    if openai_api_key:
        openai_client = OpenAI(api_key=openai_api_key)
        logger.info("Successfully initialized OpenAI client")
    else:
        openai_client = None
        logger.warning("OpenAI client not initialized due to missing key")
except ImportError:
    openai_client = None
    logger.warning("openai package not installed, some features will be unavailable")

# Initialize local LLM client
try:
    local_llm_client = LocalLLMClient()
    local_health = local_llm_client.check_health()
    if local_health.get("status") == "online":
        logger.info("Successfully initialized local LLM client")
    else:
        local_llm_client = None
        logger.warning(f"Local LLM health check failed: {local_health}")
except Exception as e:
    local_llm_client = None
    logger.warning(f"Could not initialize Local LLM client: {e}")

# Initialize router with both models
model_router = ModelRouter(openai_client, local_llm_client)

# Simple in-memory conversation history manager
class ConversationHistory:
    def __init__(self):
        self.history: Dict[str, List[Dict[str, Any]]] = {}
    
    def get_history(self, user_id: str, limit: int = None):
        if user_id not in self.history:
            self.history[user_id] = []
        return self.history[user_id][-limit:] if limit else self.history[user_id]
    
    def add_exchange(self, user_id: str, user_message: str, ai_response: str):
        if user_id not in self.history:
            self.history[user_id] = []
        self.history[user_id].append({
            "user": user_message,
            "ai": ai_response,
            "timestamp": datetime.now().isoformat()
        })
        # Keep only last 20 exchanges
        if len(self.history[user_id]) > 20:
            self.history[user_id] = self.history[user_id][-20:]
        return True

conversation_manager = ConversationHistory()

# Request and response models
class ChatRequest(BaseModel):
    message: str
    car_id: Optional[int] = None
    user_id: str = "default_user"
    conversation_history: Optional[List[str]] = None
    force_model: Optional[str] = None  # 'openai', 'local', or None

class ChatResponse(BaseModel):
    response: str
    model_used: Optional[str] = None
    confidence: Optional[float] = None
    query_types: Optional[List[str]] = None
    response_time: Optional[float] = None
    analysis: Optional[Dict[str, Any]] = None

@router.post("/api/chat", response_model=ChatResponse)
async def process_chat(request: ChatRequest):
    start_time = time.time()
    try:
        message = request.message.strip()
        car_id = request.car_id
        user_id = request.user_id
        conversation_history = request.conversation_history or []
        
        logger.info(f"Received chat request: message='{message}', car_id={car_id}")

        # Force model override if specified
        model_router.set_force_model(request.force_model)

        # Retrieve car data if available
        car_data = None
        if car_id is not None:
            try:
                from app.supabase_service import get_car_by_id
                car_data = get_car_by_id(car_id)
                logger.info(f"Retrieved car data: {car_data}")
            except Exception as e:
                logger.warning(f"Could not get car data: {e}")

        # Handle empty message
        if not message:
            return ChatResponse(
                response="I'm not sure what you're asking. Can you provide more details?",
                model_used="rule",
                confidence=1.0,
                query_types=["empty"],
                response_time=time.time() - start_time
            )

        # Build flat conversation history
        flat_history: List[str] = []
        if conversation_history:
            flat_history = conversation_history
        else:
            exchanges = conversation_manager.get_history(user_id, limit=10)
            for ex in exchanges:
                flat_history.extend([ex["user"], ex["ai"]])

        # Generate response
        result = model_router.route_query(
            query=message,
            car_data=car_data,
            conversation_history=flat_history
        )

        # Store history
        conversation_manager.add_exchange(user_id, message, result["response"])

        return ChatResponse(
            response=result["response"],
            model_used=result.get("model_used"),
            confidence=result.get("confidence"),
            query_types=result.get("query_types"),
            response_time=result.get("response_time"),
            analysis=result.get("analysis")
        )
    except Exception as e:
        logger.error(f"Error processing chat request: {e}")
        error_msg = str(e).lower()
        if "timeout" in error_msg or "rate" in error_msg:
            raise HTTPException(
                status_code=503,
                detail="Service temporarily unavailable. Please try again shortly."
            )
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred: {e}"
        )

@router.get("/api/chat/metrics")
async def get_metrics():
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
    try:
        model_router.set_force_model(model_name)
        return {"message": f"Model set to {model_name}"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
