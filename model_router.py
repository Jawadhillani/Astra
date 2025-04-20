# model_router.py
"""
Core router that directs queries between different LLM backends.
This forms the foundation of the hybrid model approach.
"""

import logging
import time
from typing import Dict, Any, Optional, List
import re

# Imports with explicit relative paths for our modules
from .query_classifier import QueryClassifier
from .response_analyzer import ResponseAnalyzer
from .automotive_system_message import create_automotive_system_message

logger = logging.getLogger(__name__)

class ModelRouter:
    """
    Routes queries between OpenAI and local LLM models based on query classification.
    """
    def __init__(self, openai_client: Any, local_llm_client: Any = None):
        self.openai_client = openai_client
        self.local_llm_client = local_llm_client
        self.query_classifier = QueryClassifier()
        self.response_analyzer = ResponseAnalyzer()
        self.force_model = None
        
        # Configuration
        self.config = {
            "openai_timeout": 15,
            "local_timeout": 30,
            "min_confidence": 0.6,
            "max_retries": 2,
            "use_streaming": False
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
        """Route with better fallback."""
        start_time = time.time()
        
        # Step 1: Classify the query
        classification = self.query_classifier.classify(query, car_data)
        logger.info(f"Query classified as {classification['query_types']} with confidence {classification['confidence']}")
        
        # Step 2: Determine which model to use
        model_choice = self._choose_model(classification, car_data)
        logger.info(f"Routing to model: {model_choice}")
        
        # Step 3: Try primary model with reduced timeout for better UX
        response = None
        local_model_available = self.local_llm_client is not None
        
        try:
            if model_choice == "local" and local_model_available:
                response = self._try_local_model(query, classification, car_data, conversation_history)
            else:
                response = self._try_openai_model(query, classification, car_data, conversation_history)
        except Exception as e:
            logger.error(f"Error from primary model ({model_choice}): {str(e)}")
            # Try fallback model
            try:
                if model_choice == "local" and self.openai_client:
                    logger.info("Falling back to OpenAI due to local model error")
                    self.metrics["fallbacks"] += 1
                    response = self._try_openai_model(query, classification, car_data, conversation_history)
                elif model_choice == "openai" and local_model_available:
                    logger.info("Falling back to local model due to OpenAI error")
                    self.metrics["fallbacks"] += 1
                    response = self._try_local_model(query, classification, car_data, conversation_history)
            except Exception as fallback_error:
                logger.error(f"Fallback model also failed: {str(fallback_error)}")
                # If both models fail, create a graceful failure response
                response = {
                    "response": "I'm having difficulty processing that query right now. Could you try asking about something more specific about this car?",
                    "model": "error",
                    "analysis": {
                        "sentiment": {"neutral": 1},
                        "common_pros": [],
                        "common_cons": []
                    }
                }
        
        # Total response time
        end_time = time.time()
        response_time = end_time - start_time
        
        # Add metadata to response
        final_response = {
            "response": response["response"],
            "model_used": response.get("model", model_choice),
            "confidence": classification["confidence"],
            "query_types": classification["query_types"],
            "response_time": response_time,
            "analysis": response.get("analysis", {})
        }
        
        logger.info(f"Response generated in {response_time:.2f} seconds using {final_response['model_used']} model")
        return final_response

    def set_force_model(self, model_name: Optional[str]):
        """
        Force all queries to use a specific model: 'openai', 'local', or None.
        """
        if model_name not in ['openai', 'local', None]:
            raise ValueError("Model must be 'openai', 'local', or None")
        self.force_model = model_name
        logger.info(f"Force model set to: {model_name}")

    def _choose_model(self, classification: Dict[str, Any], car_data: Optional[Dict]) -> str:
        """
        Decide between 'local' or 'openai' based on classification and config.
        """
        if self.force_model:
            return self.force_model
        if not self.local_llm_client:
            return "openai"
        if classification.get("routing_category") == "automotive_specific" and classification.get("confidence", 0) >= self.config["min_confidence"]:
            return "local"
        if classification.get("routing_category") == "automotive_contextual" and car_data:
            return "local"
        return "openai"

    def _try_local_model(self,
                         query: str,
                         classification: Dict[str, Any],
                         car_data: Optional[Dict],
                         conversation_history: Optional[List]) -> Dict[str, Any]:
        """
        Generate a response using the local LLM.
        """
        if not self.local_llm_client:
            raise Exception("Local LLM client not initialized")
        self.metrics["local_requests"] += 1
        start_time = time.time()

        system_prompt = create_automotive_system_message(car_data)

        # Build conversation context
        context = ""
        if conversation_history:
            recent = conversation_history[-6:] if len(conversation_history) > 6 else conversation_history
            for i in range(0, len(recent), 2):
                if i+1 < len(recent):
                    context += f"Human: {recent[i]}\nAssistant: {recent[i+1]}\n\n"

        # Construct prompt
        if car_data:
            full_prompt = f"""
Human: I want to know about the {car_data.get('year')} {car_data.get('manufacturer')} {car_data.get('model')} with {car_data.get('engine_info')}.

Specifically: {query}
"""
        else:
            full_prompt = f"{context}Human: {query}\nAssistant:" if context else f"Human: {query}\nAssistant:"

        result = self.local_llm_client.generate_response(
            prompt=full_prompt,
            system_prompt=system_prompt,
            temperature=0.7,
            max_tokens=500
        )
        response_text = re.sub(r"^(\s*Assistant:?\s*)", "", result.get("text", ""))

        elapsed = time.time() - start_time
        if self.metrics["avg_local_time"] == 0:
            self.metrics["avg_local_time"] = elapsed
        else:
            self.metrics["avg_local_time"] = (self.metrics["avg_local_time"] * (self.metrics["local_requests"] - 1) + elapsed) / self.metrics["local_requests"]

        analysis = self.response_analyzer.analyze(response_text, car_data)
        return {"response": response_text, "model": "local", "analysis": analysis}

    def _try_openai_model(self,
                          query: str,
                          classification: Dict[str, Any],
                          car_data: Optional[Dict],
                          conversation_history: Optional[List]) -> Dict[str, Any]:
        """
        Try generating a response with the OpenAI model.
        """
        start_time = time.time()
        self.metrics["openai_requests"] += 1

        system_message = create_automotive_system_message(car_data)
        messages = [{"role": "system", "content": system_message}]
        if conversation_history:
            recent = conversation_history[-10:] if len(conversation_history) > 10 else conversation_history
            for i in range(0, len(recent), 2):
                if i < len(recent): messages.append({"role": "user", "content": recent[i]})
                if i+1 < len(recent): messages.append({"role": "assistant", "content": recent[i+1]})
        messages.append({"role": "user", "content": query})

        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.7,
                max_tokens=1000,
                timeout=self.config["openai_timeout"]
            )
            response_text = response.choices[0].message.content
        except Exception as e:
            if "429" in str(e) or "quota" in str(e).lower():
                logger.warning("OpenAI quota exceeded, using local model as primary")
                self.metrics["fallbacks"] += 1
                return self._try_local_model(query, classification, car_data, conversation_history)
            else:
                logger.error(f"OpenAI error: {e}")
                raise

        elapsed = time.time() - start_time
        if self.metrics["avg_openai_time"] == 0:
            self.metrics["avg_openai_time"] = elapsed
        else:
            self.metrics["avg_openai_time"] = (self.metrics["avg_openai_time"] * (self.metrics["openai_requests"] - 1) + elapsed) / self.metrics["openai_requests"]

        analysis = self.response_analyzer.analyze(response_text, car_data)
        return {"response": response_text, "model": "openai", "analysis": analysis}

    def get_metrics(self) -> Dict[str, Any]:
        """Return performance metrics."""
        return self.metrics.copy()
