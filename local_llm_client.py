# local_llm_client.py
"""
Client for interacting with local LLM through Ollama.
This provides a consistent interface for generating responses from the local model.
"""

import requests
import logging
import time
import json
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class LocalLLMClient:
    """
    Client for interacting with Ollama-hosted language models.

    Attributes:
        base_url: The URL of the Ollama server
        model_name: The name of the model to use
        timeout: Timeout for requests to the Ollama server
    """

    def __init__(
        self,
        base_url: str = "http://localhost:11434",
       model_name: str = "phi-optimized",  # Use the optimized model
    timeout: int = 20  # Reduce timeout for better UX
    ):
        """
        Initialize the local LLM client.

        Args:
            base_url: The URL of the Ollama server
            model_name: The name of the model to use (default: phi:latest)
            timeout: Timeout for requests in seconds
        """
        self.base_url = base_url
        self.model_name = model_name
        self.timeout = timeout

        # Performance metrics
        self.metrics = {
            "total_requests": 0,
            "total_tokens": 0,
            "avg_latency": 0,
            "errors": 0
        }

        # Initial model validation
        self._validate_model()

    def _validate_model(self) -> bool:
        """
        Validate that the specified model is available.

        Returns:
            True if model is available, False otherwise
        """
        try:
            response = requests.get(
                f"{self.base_url}/api/tags",
                timeout=self.timeout
            )

            if response.status_code == 200:
                models = response.json().get("models", [])
                available = [m.get("name") for m in models]
                if self.model_name in available:
                    logger.info(f"Model {self.model_name} is available")
                    return True
                else:
                    logger.warning(f"Model {self.model_name} not found, available: {available}")
                    return False
            else:
                logger.error(f"Error checking models: {response.status_code}")
                return False

        except requests.exceptions.RequestException as e:
            logger.error(f"Error connecting to Ollama server: {e}")
            return False

    def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 250  # Reduced token count for faster responses
    ) -> Dict[str, Any]:
        """Generate a response with better timeout handling."""
        start_time = time.time()
        self.metrics["total_requests"] += 1

        try:
            # Prepare the request payload with optimizations
            payload = {
               "model": self.model_name,
                 "prompt": prompt,
                 "stream": False,
         "options": {
                 "temperature": temperature,
                "num_predict": max_tokens,
                "repeat_penalty": 1.1,
                "top_k": 40,           # More focused sampling
                "top_p": 0.9,          # More focused sampling
                 "frequency_penalty": 0.0,  # Don't penalize topic words
                "presence_penalty": 0.0,   # Don't penalize topic words
                }
            }

            # Add system prompt if provided (but keep it concise)
            if system_prompt:
                payload["system"] = system_prompt[:300]

            logger.info(f"Sending request to {self.model_name} model")

            # Use a shorter timeout for initial query
            timeout = min(15, self.timeout)

            # Send the request to Ollama
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=timeout
            )

            # Calculate latency and update metrics
            latency = time.time() - start_time
            # Update running average latency
            if self.metrics.get("avg_latency", 0) == 0:
                self.metrics["avg_latency"] = latency
            else:
                count = self.metrics["total_requests"]
                self.metrics["avg_latency"] = (
                    self.metrics["avg_latency"] * (count - 1) + latency
                ) / count

            if response.status_code == 200:
                result = response.json()
                tokens = result.get("eval_count", 0)
                self.metrics["total_tokens"] += tokens
                logger.info(f"Generated response in {latency:.2f}s ({tokens} tokens)")
                return {
                    "text": result.get("response", ""),
                    "model": self.model_name,
                    "tokens": tokens,
                    "latency": latency
                }
            else:
                self.metrics["errors"] += 1
                logger.error(f"Error from Ollama API: {response.status_code}")
                return {
                    "text": "I'm having trouble processing that request. Could you try asking something more specific about this car?",
                    "model": self.model_name,
                    "error": True,
                    "latency": latency
                }

        except requests.exceptions.Timeout:
            self.metrics["errors"] += 1
            logger.error(f"Timeout after {time.time() - start_time:.2f}s")
            return {
                "text": "I need a moment to think about that. Could you ask a simpler car-related question?",
                "model": self.model_name,
                "error": True,
                "latency": time.time() - start_time
            }

        except Exception as e:
            self.metrics["errors"] += 1
            logger.error(f"Error generating response: {e}")
            return {
                "text": "I encountered an issue processing your question. Let's try something more specific about this vehicle's features.",
                "model": self.model_name,
                "error": True,
                "latency": time.time() - start_time
            }

    def check_health(self) -> Dict[str, Any]:
        """Check the health of the Ollama server."""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=self.timeout)
            if response.status_code == 200:
                return {"status": "online", "models": response.json().get("models", []), "latency": response.elapsed.total_seconds()}
            else:
                return {"status": "error", "error": f"HTTP {response.status_code}", "latency": response.elapsed.total_seconds()}
        except Exception as e:
            return {"status": "offline", "error": str(e)}

    def get_metrics(self) -> Dict[str, Any]:
        """Get performance metrics."""
        return self.metrics.copy()
