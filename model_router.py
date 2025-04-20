# model_router.py
"""
Core router that directs queries between different LLM backends.
This forms the foundation of the hybrid model approach.
"""

import logging
import time
from typing import Dict, Any, Optional, List, Callable
import re

# Imports with explicit relative paths for our modules
from .query_classifier import QueryClassifier
from .response_analyzer import ResponseAnalyzer
from .automotive_system_message import create_automotive_system_message

logger = logging.getLogger(__name__)

class ModelRouter:
    """
    Routes queries between OpenAI and local LLM models based on query classification.
    
    Attributes:
        openai_client: Client for OpenAI API
        local_llm_client: Client for local LLM
        query_classifier: Classifier to determine routing
        force_model: Optional override to force using a specific model
    """
    
    def __init__(self, openai_client: Any, local_llm_client: Any = None):
        """
        Initialize the model router.
        
        Args:
            openai_client: Client for OpenAI API
            local_llm_client: Client for local LLM (can be None initially)
        """
        self.openai_client = openai_client
        self.local_llm_client = local_llm_client
        self.query_classifier = QueryClassifier()
        self.response_analyzer = ResponseAnalyzer()
        self.force_model = None
        
        # Configuration
        self.config = {
            "openai_timeout": 15,  # seconds
            "local_timeout": 30,   # seconds
            "min_confidence": 0.6, # minimum confidence to use local model
            "max_retries": 2,      # max retries for the primary model before fallback
            "use_streaming": False # whether to use streaming responses
        }
        
        # Performance metrics
        self.metrics = {
            "openai_requests": 0,
            "local_requests": 0,
            "fallbacks": 0,
            "avg_openai_time": 0,
            "avg_local_time": 0
        }
        
    def route_query(self, 
                    query: str, 
                    car_data: Optional[Dict] = None,
                    conversation_history: Optional[List] = None) -> Dict[str, Any]:
        """
        Route a query to the appropriate model and return the response.
        
        Args:
            query: User query
            car_data: Optional car data for context
            conversation_history: Optional conversation history
            
        Returns:
            Dictionary with response and metadata
        """
        start_time = time.time()
        
        # Step 1: Classify the query
        classification = self.query_classifier.classify(query, car_data)
        logger.info(f"Query classified as {classification['query_types']} with confidence {classification['confidence']}")
        
        # Step 2: Determine which model to use
        model_choice = self._choose_model(classification, car_data)
        logger.info(f"Routing to model: {model_choice}")
        
        # Step 3: Try primary model
        response = None
        local_model_available = self.local_llm_client is not None
        
        if model_choice == "local" and local_model_available:
            try:
                response = self._try_local_model(query, classification, car_data, conversation_history)
            except Exception as e:
                logger.error(f"Error using local model: {str(e)}")
                logger.info("Falling back to OpenAI")
                self.metrics["fallbacks"] += 1
                model_choice = "openai"  # Fall back to OpenAI
        
        # If we're using OpenAI (originally or as fallback)
        if model_choice == "openai" or response is None:
            try:
                response = self._try_openai_model(query, classification, car_data, conversation_history)
            except Exception as e:
                logger.error(f"Error using OpenAI model: {str(e)}")
                # If we already tried local and it failed, we're out of options
                if model_choice == "local":
                    raise Exception("Both models failed to generate a response")
                
                # If we haven't tried local yet and it's available, try it as a fallback
                if local_model_available:
                    logger.info("Falling back to local model")
                    self.metrics["fallbacks"] += 1
                    try:
                        response = self._try_local_model(query, classification, car_data, conversation_history)
                    except Exception as e2:
                        logger.error(f"Error using local model as fallback: {str(e2)}")
                        raise Exception("Both models failed to generate a response")
                else:
                    # No fallback options
                    raise
        
        # Calculate time and update metrics
        end_time = time.time()
        response_time = end_time - start_time
        
        # Add metadata to response
        response_with_metadata = {
            "response": response["response"],
            "model_used": response["model"],
            "confidence": classification["confidence"],
            "query_types": classification["query_types"],
            "response_time": response_time,
            "analysis": response.get("analysis", {})
        }
        
        logger.info(f"Response generated in {response_time:.2f} seconds using {response['model']} model")
        return response_with_metadata
    
    def set_force_model(self, model_name: Optional[str]):
        """
        Set a model to force use for all queries (for testing/demo).
        
        Args:
            model_name: 'openai', 'local', or None (to disable forcing)
        """
        if model_name not in ['openai', 'local', None]:
            raise ValueError("Model must be 'openai', 'local', or None")
        self.force_model = model_name
        logger.info(f"Force model set to: {model_name}")
    
    def _choose_model(self, classification: Dict[str, Any], car_data: Optional[Dict]) -> str:
        """
        Choose which model to use based on classification results.
        
        Args:
            classification: Classification results
            car_data: Optional car data
            
        Returns:
            'local' or 'openai'
        """
        # If forcing a specific model, use that
        if self.force_model:
            return self.force_model
            
        # If local model isn't available, always use OpenAI
        if not self.local_llm_client:
            return "openai"
        
        # Decision logic based on classification
        if classification["routing_category"] == "automotive_specific":
            # For automotive specific queries, prefer local model
            if classification["confidence"] >= self.config["min_confidence"]:
                return "local"
        
        elif classification["routing_category"] == "automotive_contextual" and car_data:
            # For automotive contextual queries with car data, use local model
            return "local"
            
        # Default to OpenAI
        return "openai"
    
    def _try_local_model(self, 
                         query: str, 
                         classification: Dict[str, Any],
                         car_data: Optional[Dict], 
                         conversation_history: Optional[List]) -> Dict[str, Any]:
        """
        Try generating a response with the local model.
        
        Args:
            query: User query
            classification: Query classification results
            car_data: Optional car data
            conversation_history: Optional conversation history
            
        Returns:
            Response dictionary with text and metadata
        """
        if not self.local_llm_client:
            raise Exception("Local LLM client not initialized")
            
        # Update metrics
        self.metrics["local_requests"] += 1
        start_time = time.time()
        
        # Create system prompt for local model
        system_prompt = create_automotive_system_message(car_data)
        
        # Format conversation history for context
        context = ""
        if conversation_history:
            # Include limited recent history (last 3 exchanges)
            recent_history = conversation_history[-6:] if len(conversation_history) > 6 else conversation_history
            
            for i in range(0, len(recent_history), 2):
                if i+1 < len(recent_history):  # Make sure we have both user and assistant
                    context += f"Human: {recent_history[i]}\nAssistant: {recent_history[i+1]}\n\n"
        
        # Combine context and query
        if context:
            full_prompt = f"{context}Human: {query}\nAssistant:"
        else:
            full_prompt = f"Human: {query}\nAssistant:"
        
        # Call local model
        result = self.local_llm_client.generate_response(
            prompt=full_prompt,
            system_prompt=system_prompt,
            temperature=0.7,
            max_tokens=500
        )
        
        # Extract response text
        response_text = result.get("text", "")
        
        # Sometimes Ollama adds "Assistant:" to the beginning, remove it
        response_text = re.sub(r"^(\s*Assistant:?\s*)", "", response_text)
        
        # Update metrics
        end_time = time.time()
        response_time = end_time - start_time
        
        # Update running average of response time
        if self.metrics["avg_local_time"] == 0:
            self.metrics["avg_local_time"] = response_time
        else:
            self.metrics["avg_local_time"] = (self.metrics["avg_local_time"] * (self.metrics["local_requests"] - 1) + response_time) / self.metrics["local_requests"]
        
        # Analyze response
        analysis = self.response_analyzer.analyze(response_text, car_data)
        
        return {
            "response": response_text,
            "model": "local",
            "analysis": analysis
        }
    
    def _try_openai_model(self, 
                          query: str, 
                          classification: Dict[str, Any],
                          car_data: Optional[Dict], 
                          conversation_history: Optional[List]) -> Dict[str, Any]:
        """
        Try generating a response with the OpenAI model.
        
        Args:
            query: User query
            classification: Query classification results
            car_data: Optional car data
            conversation_history: Optional conversation history
            
        Returns:
            Response dictionary with text and metadata
        """
        start_time = time.time()
        self.metrics["openai_requests"] += 1
        
        # Create system message
        system_message = create_automotive_system_message(car_data)
        
        # Format messages for OpenAI
        messages = [
            {"role": "system", "content": system_message}
        ]
        
        # Add conversation history if available
        if conversation_history:
            # Only include recent history to avoid token limits (last 5 turns)
            recent_history = conversation_history[-10:] if len(conversation_history) > 10 else conversation_history
            
            for i in range(0, len(recent_history), 2):
                if i < len(recent_history):
                    messages.append({"role": "user", "content": recent_history[i]})
                if i+1 < len(recent_history):
                    messages.append({"role": "assistant", "content": recent_history[i+1]})
        
        # Add the current query
        messages.append({"role": "user", "content": query})
        
        # Call OpenAI API
        response = self.openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0.7,
            max_tokens=1000,
            timeout=self.config["openai_timeout"]
        )
        
        # Extract response text
        response_text = response.choices[0].message.content
        
        # Analyze response
        analysis = self.response_analyzer.analyze(response_text, car_data)
        
        # Update metrics
        end_time = time.time()
        response_time = end_time - start_time
        
        # Update running average of response time
        if self.metrics["avg_openai_time"] == 0:
            self.metrics["avg_openai_time"] = response_time
        else:
            self.metrics["avg_openai_time"] = (self.metrics["avg_openai_time"] * (self.metrics["openai_requests"] - 1) + response_time) / self.metrics["openai_requests"]
        
        return {
            "response": response_text,
            "model": "openai",
            "analysis": analysis
        }
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Get performance metrics for the router.
        
        Returns:
            Dictionary of metrics
        """
        return self.metrics.copy()