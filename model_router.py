import logging
import time
import re
from typing import Dict, Any, Optional, List

# Imports with explicit relative paths for our modules
from .query_classifier import QueryClassifier
from .response_analyzer import ResponseAnalyzer
from .automotive_system_message import create_automotive_system_message

logger = logging.getLogger(__name__)


class ModelRouter:
    """Route queries between OpenAI and a local LLM (Ollama)."""

    # ------------------------------------------------------------------
    # Initialisation
    # ------------------------------------------------------------------
    def __init__(self, openai_client: Any, local_llm_client: Any | None = None) -> None:
        self.openai_client = openai_client
        self.local_llm_client = local_llm_client
        self.query_classifier = QueryClassifier()
        self.response_analyzer = ResponseAnalyzer()
        self.force_model: str | None = None

        # Configuration
        self.config: dict[str, Any] = {
            "openai_timeout": 15,
            "local_timeout": 30,
            "min_confidence": 0.6,
            "max_retries": 2,
            "use_streaming": False,
        }

        # Metrics
        self.metrics: dict[str, float | int] = {
            "openai_requests": 0,
            "local_requests": 0,
            "fallbacks": 0,
            "avg_openai_time": 0.0,
            "avg_local_time": 0.0,
        }

    # ------------------------------------------------------------------
    # Public helpers
    # ------------------------------------------------------------------
    def set_force_model(self, model_name: str | None) -> None:
        if model_name not in {"openai", "local", None}:
            raise ValueError("Model must be 'openai', 'local', or None")
        self.force_model = model_name
        logger.info("Force model set to %s", model_name)

    def get_metrics(self) -> dict[str, Any]:
        return self.metrics.copy()

    # ------------------------------------------------------------------
    # Core routing
    # ------------------------------------------------------------------
    def route_query(
        self,
        query: str,
        car_data: Optional[dict] = None,
        conversation_history: Optional[List[str]] = None,
    ) -> dict[str, Any]:
        start_time = time.time()

        # 1) classify
        classification = self.query_classifier.classify(query, car_data)
        logger.info(
            "Query classified as %s (confidence %.2f)",
            classification["query_types"],
            classification["confidence"],
        )

        # 2) choose model
        model_choice = self._choose_model()
        logger.info("Routing to model: %s", model_choice)

        try:
            if model_choice == "local" and self.local_llm_client:
                response = self._try_local_model(query, car_data, conversation_history)
            else:
                response = self._try_openai_model(query, car_data, conversation_history)
        except Exception as exc:  # noqa: BLE001
            logger.error("Primary model (%s) failed: %s", model_choice, exc)
            response = self._fallback(model_choice, query, car_data, conversation_history)

        elapsed = time.time() - start_time
        return {
            "response": response["response"],
            "model_used": response["model"],
            "confidence": classification["confidence"],
            "query_types": classification["query_types"],
            "response_time": elapsed,
            "analysis": response.get("analysis", {}),
        }

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _choose_model(self) -> str:
        if self.force_model:
            return self.force_model
        if self.openai_client:
            return "openai"
        if self.local_llm_client:
            return "local"
        return "openai"

    def _fallback(
        self,
        failed_model: str,
        query: str,
        car_data: Optional[dict],
        conversation_history: Optional[List[str]],
    ) -> dict[str, Any]:
        self.metrics["fallbacks"] += 1
        if failed_model == "openai" and self.local_llm_client:
            logger.info("Falling back to local model")
            return self._try_local_model(query, car_data, conversation_history)
        if failed_model == "local" and self.openai_client:
            logger.info("Falling back to OpenAI model")
            return self._try_openai_model(query, car_data, conversation_history)
        return {
            "response": "Sorry, I'm having trouble right now. Please try again soon!",
            "model": "error",
            "analysis": {"sentiment": {"neutral": 1}},
        }

    # ------------------------------------------------------------------
    # Model wrappers
    # ------------------------------------------------------------------
    def _try_local_model(
        self,
        query: str,
        car_data: Optional[dict],
        conversation_history: Optional[List[str]],
    ) -> dict[str, Any]:
        if not self.local_llm_client:
            raise RuntimeError("Local LLM client not configured")

        self.metrics["local_requests"] += 1
        start = time.time()

        system_prompt = create_automotive_system_message(car_data)
        user_prompt = (
            f"About the {car_data.get('year')} {car_data.get('manufacturer')} {car_data.get('model')}: {query}\nAnswer:"
            if car_data
            else f"Human: {query}\nAssistant:"
        )

        result = self.local_llm_client.generate_response(
            prompt=user_prompt,
            system_prompt=system_prompt,
            temperature=0.7,
            max_tokens=400,
        )
        if result.get("error"):
            raise RuntimeError(f"Local LLM error: {result['text']}")

        response_text = re.sub(r"^(\s*Assistant:?\s*)", "", result.get("text", "")).strip()

        self._update_avg("avg_local_time", "local_requests", time.time() - start)
        analysis = self.response_analyzer.analyze(response_text, car_data)
        return {"response": response_text, "model": "local", "analysis": analysis}

    def _try_openai_model(
        self,
        query: str,
        car_data: Optional[dict],
        conversation_history: Optional[List[str]],
    ) -> dict[str, Any]:
        if not self.openai_client:
            raise RuntimeError("OpenAI client not configured")

        self.metrics["openai_requests"] += 1
        start = time.time()

        # Build system message and style guide
        system_message = create_automotive_system_message(car_data)
        style_guide = (
            "\n\n### Style Guide ###\n"
            "- Talk like an excited best‑buddy mechanic 😎🛠️.\n"
            "- Max **3 punchy sentences** (~90 tokens).\n"
            "- Fun slang, exclamations, rhetorical questions!\n"
            "- Sprinkle 2–4 fitting emojis.\n"
            "- End with a cheeky invite like 'Hop in?'."
        )
        system_message += style_guide

        messages: list[dict[str, str]] = [{"role": "system", "content": system_message}]
        if conversation_history:
            recent = conversation_history[-10:] if len(conversation_history) > 10 else conversation_history
            for i in range(0, len(recent), 2):
                messages.append({"role": "user", "content": recent[i]})
                if i + 1 < len(recent):
                    messages.append({"role": "assistant", "content": recent[i + 1]})
        messages.append({"role": "user", "content": query})

        try:
            resp = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.95,
                max_tokens=250,
                timeout=self.config["openai_timeout"],
                top_p=0.9,
                presence_penalty=0.3,
            )
            response_text = resp.choices[0].message.content.strip()
        except Exception as exc:  # noqa: BLE001
            if "429" in str(exc) or "quota" in str(exc).lower():
                logger.warning("OpenAI quota hit; falling back to local model")
                return self._fallback("openai", query, car_data, conversation_history)
            raise

        self._update_avg("avg_openai_time", "openai_requests", time.time() - start)
        analysis = self.response_analyzer.analyze(response_text, car_data)
        return {"response": response_text, "model": "openai", "analysis": analysis}

    # ------------------------------------------------------------------
    # Utility
    # ------------------------------------------------------------------
    def _update_avg(self, avg_key: str, count_key: str, new_time: float) -> None:
        count = self.metrics[count_key]
        prev_avg = self.metrics[avg_key]
        self.metrics[avg_key] = new_time if count == 0 else (prev_avg * (count - 1) + new_time) / count
