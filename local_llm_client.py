# local_llm_client.py
"""
Client for interacting with local LLM through Ollama.
This provides a consistent interface for generating responses from the local model.
"""

import requests
import logging
import time
import json
from typing import Dict, Any, Optional, List, Union

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
        model_name: str = "phi",
        timeout: int = 30
    ):
        """
        Initialize the local LLM client.
        
        Args:
            base_url: The URL of the Ollama server
            model_name: The name of the model to use (default: phi)
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
                available_models = [model["name"] for model in models]
                
                if self.model_name in available_models:
                    logger.info(f"Model {self.model_name} is available")
                    return True
                else:
                    logger.warning(f"Model {self.model_name} not found, available models: {available_models}")
                    return False
            else:
                logger.error(f"Error checking models: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Error connecting to Ollama server: {str(e)}")
            return False
    
    def generate_response(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> Dict[str, Any]:
        """
        Generate a response from the local LLM.
        
        Args:
            prompt: The user prompt to send to the model
            system_prompt: Optional system prompt for context
            temperature: Temperature for generation (0.0 to 1.0)
            max_tokens: Maximum tokens to generate
            
        Returns:
            Dictionary with response text and metadata
        """
        start_time = time.time()
        self.metrics["total_requests"] += 1
        
        try:
            # Prepare the request payload
            payload = {
                "model": self.model_name,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens
                }
            }
            
            # Add system prompt if provided
            if system_prompt:
                payload["system"] = system_prompt
            
            # Log the request (avoid logging the full prompt in production)
            logger.info(f"Sending request to {self.model_name} model")
            
            # Send the request to Ollama
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=self.timeout
            )
            
            # Calculate latency
            latency = time.time() - start_time
            
            # Update metrics
            if self.metrics["avg_latency"] == 0:
                self.metrics["avg_latency"] = latency
            else:
                # Running average
                self.metrics["avg_latency"] = (
                    (self.metrics["avg_latency"] * (self.metrics["total_requests"] - 1) + latency) / 
                    self.metrics["total_requests"]
                )
            
            # Handle response
            if response.status_code == 200:
                result = response.json()
                
                # Extract tokens and update metrics
                tokens_generated = result.get("eval_count", 0)
                self.metrics["total_tokens"] += tokens_generated
                
                logger.info(f"Generated response in {latency:.2f}s ({tokens_generated} tokens)")
                
                return {
                    "text": result.get("response", ""),
                    "model": self.model_name,
                    "tokens": tokens_generated,
                    "latency": latency
                }
            else:
                self.metrics["errors"] += 1
                error_message = f"Error from Ollama API: {response.status_code}"
                logger.error(error_message)
                
                # Try to get error details if available
                try:
                    error_details = response.json()
                    error_message += f" - {error_details.get('error', '')}"
                except:
                    pass
                
                return {
                    "text": f"Error generating response: {error_message}",
                    "model": self.model_name,
                    "error": True,
                    "latency": latency
                }
                
        except requests.exceptions.Timeout:
            self.metrics["errors"] += 1
            logger.error(f"Timeout while waiting for response from Ollama (after {time.time() - start_time:.2f}s)")
            return {
                "text": "The local model took too long to respond. Please try again or use a smaller prompt.",
                "model": self.model_name,
                "error": True,
                "latency": time.time() - start_time
            }
            
        except Exception as e:
            self.metrics["errors"] += 1
            logger.error(f"Error generating response: {str(e)}")
            return {
                "text": f"Error generating response: {str(e)}",
                "model": self.model_name,
                "error": True,
                "latency": time.time() - start_time
            }
    
    def check_health(self) -> Dict[str, Any]:
        """
        Check the health of the Ollama server.
        
        Returns:
            Dictionary with health status
        """
        try:
            response = requests.get(
                f"{self.base_url}/api/tags",
                timeout=self.timeout
            )
            
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
            return {
                "status": "offline",
                "error": str(e)
            }
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Get performance metrics.
        
        Returns:
            Dictionary of metrics
        """
        return self.metrics.copy()