from __future__ import annotations
"""OpenAI‑powered (or mocked) car‑review generator.

**This file is the fully fixed `openai_service.py`.**  It eliminates the
previous syntax error, enforces strict JSON output from OpenAI, and contains a
concise mock fallback. Replace your local copy with this content.
"""

# ---------------------------------------------------------------------------
# Imports & setup
# ---------------------------------------------------------------------------
import datetime
import json
import logging
import os
import random
from typing import Any, Dict, List

from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY")
USE_MOCK: bool = not bool(OPENAI_API_KEY)

try:
    import openai  # type: ignore

    if not USE_MOCK:
        try:
            client = openai.OpenAI(api_key=OPENAI_API_KEY)
            logger.info("OpenAI client initialised ✅")
        except Exception as exc:
            logger.error("Failed to initialise OpenAI client: %s", exc)
            USE_MOCK = True
            client = None
    else:
        logger.warning("OPENAI_API_KEY not set – using mock mode ✨")
        client = None
except ImportError:
    logger.warning("openai package missing – using mock mode ✨")
    USE_MOCK = True
    client = None

# ---------------------------------------------------------------------------
# Public function
# ---------------------------------------------------------------------------

def generate_car_review(car_data: Dict[str, Any]) -> str:
    """Return a **JSON string** review of `car_data` (guaranteed JSON)."""
    if not isinstance(car_data, dict):
        return json.dumps({
            "review_title": "Error: Invalid Car Data",
            "rating": 0,
            "review_text": "Unable to generate review due to invalid car data.",
            "author": "System",
            "pros": [],
            "cons": [],
        })

    if USE_MOCK:
        return _mock_review(car_data)

    prompt = _build_prompt(car_data)
    try:
        response = client.chat.completions.create(  # type: ignore[attr-defined]
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an automotive journalist with 20+ years of experience. "
                        "Provide balanced, technically accurate reviews. "
                        "ALWAYS return valid JSON – no markdown, no code fencing."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=1500,
        )
        raw = response.choices[0].message.content.strip()  # type: ignore[index]
        cleaned = _strip_md_fence(raw)
        if _valid_json(cleaned):
            return cleaned
        import re
        match = re.search(r"\{[\s\S]*?\}", cleaned)
        if match and _valid_json(match.group(0)):
            return match.group(0)
    except Exception as exc:
        logger.error("OpenAI error: %s", exc)
    # Fallback if anything went wrong
    return _mock_review(car_data)

# ---------------------------------------------------------------------------
# Prompt builder & markdown clean‑ups
# ---------------------------------------------------------------------------

def _build_prompt(cd: Dict[str, Any]) -> str:
    return f"""
Write a detailed car review for a {cd.get('year')} {cd.get('manufacturer')} {cd.get('model')}.

Technical Specs:
- Engine: {cd.get('engine_info', 'N/A')}
- Transmission: {cd.get('transmission', 'N/A')}
- Fuel: {cd.get('fuel_type', 'N/A')}
- MPG: {cd.get('mpg', 'N/A')}
- Body Type: {cd.get('body_type', 'N/A')}

Include:
1. A catchy title.
2. Overall rating (1‑5, one decimal).
3. Performance & tech evaluation.
4. Personal impressions & value assessment.
5. Pros & Cons lists (≥3 each).

Return **VALID JSON ONLY** (no markdown fences) with keys:
review_title, rating, review_text, author, pros, cons
"""


def _strip_md_fence(text: str) -> str:
    if not text.startswith("```"):
        return text
    lines = text.split("\n")
    out: list[str] = []
    capture = False
    for ln in lines:
        if ln.startswith("```json"):
            capture = True
            continue
        if ln.startswith("```") and capture:
            break
        if capture:
            out.append(ln)
    return "\n".join(out).strip() or text


def _valid_json(s: str) -> bool:
    try:
        json.loads(s)
        return True
    except json.JSONDecodeError:
        return False

# ---------------------------------------------------------------------------
# Mock review (offline or fallback)
# ---------------------------------------------------------------------------

def _mock_review(cd: Dict[str, Any]) -> str:
    defaults = {
        "year": "2020",
        "manufacturer": "Generic",
        "model": "Car",
        "body_type": "vehicle",
        "engine_info": "engine",
        "transmission": "transmission",
        "fuel_type": "fuel",
        "mpg": "N/A",
    }
    cd = {**defaults, **cd}
    sentiment = _sentiment(cd)
    rating = round(random.uniform(*{"positive": (4.0, 4.8), "neutral": (3.0, 3.9), "negative": (1.8, 2.9)}[sentiment]), 1)
    review = {
        "review_title": {
            "positive": f"{cd['year']} {cd['manufacturer']} {cd['model']}: A Solid Choice",
            "neutral": f"{cd['year']} {cd['manufacturer']} {cd['model']}: Mixed Bag",
            "negative": f"{cd['year']} {cd['manufacturer']} {cd['model']}: Needs Work",
        }[sentiment],
        "rating": rating,
        "review_text": (
            {
                "positive": f"The {cd['year']} {cd['manufacturer']} {cd['model']} impresses with a peppy {cd['engine_info']} and {cd['mpg']} MPG.\n\nOverall score: {rating}/5 – a well‑rounded contender.",
                "neutral": f"The {cd['year']} {cd['manufacturer']} {cd['model']} is competent but rarely excites.\n\nI rate it {rating}/5 – fine if the price is right.",
                "negative": f"The {cd['year']} {cd['manufacturer']} {cd['model']} struggles to stand out.\n\nOnly {rating}/5 – explore alternatives first.",
            }[sentiment]
        ),
        "author": random.choice(["Michael Thompson", "Sarah Johnson", "James Rodriguez", "Emma Davis"]),
        "pros": _pros(cd, sentiment),
        "cons": _cons(cd, sentiment),
    }
    return json.dumps(review)

# ---------------------------------------------------------------------------
# Helper – sentiment & pros/cons
# ---------------------------------------------------------------------------

def _sentiment(cd: Dict[str, Any]) -> str:
    manuf = cd.get("manufacturer", "").lower()
    year = int(cd.get("year", 0) or 0)
    curr = datetime.datetime.now().year
    weights = {"positive": 40, "neutral": 40, "negative": 20}
    if manuf in {"tesla", "toyota", "lexus", "honda"}:
        weights["positive"] += 15; weights["negative"] -= 10
    elif manuf in {"fiat", "mitsubishi"}:
        weights["negative"] += 15; weights["positive"] -= 10
    if year >= curr - 2:
        weights["positive"] += 10; weights["negative"] -= 5
    elif year <= curr - 10:
        weights["negative"] += 15; weights["positive"] -= 10
    roll = random.uniform(0, sum(weights.values()))
    cum = 0
    for k, w in weights.items():
        cum += w
        if roll <= cum:
            return k
    return "neutral"


def _pros(cd: Dict[str, Any], sent: str) -> List[str]:
    base = ["User‑friendly infotainment", "Smooth gearbox", "Everyday practicality"]
    extra = {
        "positive": [f"Excellent economy ({cd['mpg']} MPG)", f"Peppy {cd['engine_info']}", "Premium cabin materials"],
        "neutral": ["Decent ride comfort", "Reasonable cargo space"],
        "negative": ["Distinctive styling", "Affordable base price"],
    }[sent]
    return random.sample(extra, k=min(len(extra), {"positive": 3, "neutral": 2, "negative": 2}[sent])) + random.sample(base, k=1)


def _cons(cd: Dict[str, Any], sent: str) -> List[str]:
    base = ["Advanced features on higher trims", "Middling warranty", "Cabin storage could be better"]
    extra = {
        "positive": ["Higher starting price than rivals", "Limited rear visibility"],
        "neutral": ["Fuel economy trails leaders", "Performance is average", "Road noise at speed"],
        "negative": ["Underpowered engine", "Cheap interior materials", "Outdated tech", "Excessive road noise"],
    }[sent]
    return random.sample(extra, k=min(len(extra), {"positive": 2, "neutral": 3, "negative": 4}[sent])) + random.sample(base, k=1)