"""
Client for interacting with local LLM through Ollama.
This provides a consistent interface for generating responses from the local model.
"""

import requests
import logging
import time
import json
from typing import Dict, Any, Optional

# Import pattern matching for common phrases
from .chatbot_responses import get_response_for_pattern

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
        model_name: str = "tinyllama:latest",  # CORRECT MODEL NAME
        timeout: int = 10
    ):
        """
        Initialize the local LLM client.

        Args:
            base_url: The URL of the Ollama server
            model_name: The name of the model to use (default: tinyllama:latest)
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
        max_tokens: int = 250
    ) -> Dict[str, Any]:
        """
        Generate a response with minimal payload optimizations:
        - Pattern matching for quick replies
        - Greeting overrides
        - Simple vs complex query handling
        - Ultra-minimal Ollama payload
        """
        start_time = time.time()
        self.metrics["total_requests"] += 1

        # Pattern-based quick response
        pattern_response = get_response_for_pattern(prompt)
        if pattern_response:
            return {
                "text": pattern_response,
                "model": "pattern_match",
                "tokens": 0,
                "latency": 0.1
            }

        # Greeting override
        lower_prompt = prompt.lower().strip()
        greetings = ["hi", "hello", "hey", "hi there", "hello there"]
        if lower_prompt in greetings:
            actual_prompt = (
                f"The user said: {prompt}\n\n"
                "Respond with a friendly, brief greeting as a car assistant."
            )
        else:
            actual_prompt = prompt

        # Determine simplicity for timeout and payload
        simple_query = actual_prompt.lower().strip()
        is_simple = len(simple_query.split()) < 10
        timeout = 5 if is_simple else 10

        try:
            # Ultra-minimal payload for Ollama
            payload = {
                "model": self.model_name,
                "prompt": actual_prompt if is_simple else actual_prompt[:200],
                "stream": False,
                "options": {
                    "num_predict": 30 if is_simple else 100
                }
            }

            logger.info(f"Sending ultra-minimal request to {self.model_name}")
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=timeout
            )

            latency = time.time() - start_time

            if response.status_code == 200:
                first_line = response.text.split('\n')[0]
                try:
                    result = json.loads(first_line)
                    tokens = result.get("eval_count", 0)
                    self.metrics["total_tokens"] += tokens
                    self._update_latency(latency)
                    logger.info(f"Generated response in {latency:.2f}s ({tokens} tokens)")
                    return {
                        "text": result.get("response", ""),
                        "model": self.model_name,
                        "tokens": tokens,
                        "latency": latency
                    }
                except json.JSONDecodeError as e:
                    logger.error(f"JSON parsing error: {e}")
                    return {
                        "text": "I'm having trouble processing your request. Could you ask a simple question about this vehicle?",
                        "model": self.model_name,
                        "error": True,
                        "latency": latency
                    }
            else:
                logger.error(f"Error from Ollama API: {response.status_code}")
                return {
                    "text": "I encountered a technical issue. Try asking about specific car features instead.",
                    "model": self.model_name,
                    "error": True,
                    "latency": latency
                }
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            latency = time.time() - start_time
            return {
                "text": "I need a moment to think about that. Could you ask a simpler car-related question?",
                "model": self.model_name,
                "error": True,
                "latency": latency
            }

    def _update_latency(self, latency: float) -> None:
        """Helper to update running average latency."""
        count = self.metrics["total_requests"]
        avg = self.metrics.get("avg_latency", 0)
        if count == 1:
            self.metrics["avg_latency"] = latency
        else:
            self.metrics["avg_latency"] = (avg * (count - 1) + latency) / count

    def check_health(self) -> Dict[str, Any]:
        """Check the health of the Ollama server."""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=self.timeout)
            if response.status_code == 200:
                return {
                    "status": "online",
                    "models": response.json().get("models", []),
                    "latency": response.elapsed.total_seconds()
                }
            else:
                return {
                    "status": "error",
                    "error": f"HTTP {response.status_code}",
                    "latency": response.elapsed.total_seconds()
                }
        except Exception as e:
            return {"status": "offline", "error": str(e)}

    def get_metrics(self) -> Dict[str, Any]:
        """Get performance metrics."""
        return self.metrics.copy()