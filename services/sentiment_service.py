import json
import os
import re

import requests
from dotenv import load_dotenv

load_dotenv()

API_URL = os.getenv("AI_API_URL", "").strip()
API_KEY = os.getenv("AI_API_KEY", "").strip()
MODEL = os.getenv("AI_MODEL", "").strip()


POSITIVE_WORDS = {
    "amazing", "awesome", "excellent", "great", "good", "love",
    "loved", "perfect", "wonderful", "fantastic", "best", "happy",
    "satisfied", "beautiful", "useful", "recommend", "impressive",
    "comfortable", "easy", "fast", "helpful", "smooth"
}

NEGATIVE_WORDS = {
    "bad", "terrible", "awful", "worst", "hate", "hated",
    "poor", "broken", "damaged", "disappointed", "slow",
    "defective", "useless", "annoying", "problem", "issue",
    "waste", "uncomfortable", "difficult", "failed", "failure"
}


def simulated_sentiment(review):
    words = set(re.findall(r"\b[a-z]+\b", review.lower()))

    positive_matches = words & POSITIVE_WORDS
    negative_matches = words & NEGATIVE_WORDS

    if len(positive_matches) > len(negative_matches):
        sentiment = "Positive"
        confidence = 75 + min(len(positive_matches) * 5, 20)
        explanation = (
            "Simulation: positive keywords detected: "
            + ", ".join(sorted(positive_matches))
        )

    elif len(negative_matches) > len(positive_matches):
        sentiment = "Negative"
        confidence = 75 + min(len(negative_matches) * 5, 20)
        explanation = (
            "Simulation: negative keywords detected: "
            + ", ".join(sorted(negative_matches))
        )

    else:
        sentiment = "Neutral"
        confidence = 60
        explanation = "Simulation: no clear sentiment keyword pattern detected."

    return {
        "review": review,
        "sentiment": sentiment,
        "confidence": confidence,
        "explanation": explanation
    }


def simulate_reviews(reviews):
    results = [simulated_sentiment(review) for review in reviews]

    counts = {
        "Positive": 0,
        "Negative": 0,
        "Neutral": 0
    }

    for result in results:
        counts[result["sentiment"]] += 1

    total = len(results)

    summary = (
        f"Simulation results: {counts['Positive']} positive, "
        f"{counts['Negative']} negative and "
        f"{counts['Neutral']} neutral reviews."
    )

    themes = []

    if counts["Positive"]:
        themes.append({
            "name": "Positive keywords",
            "sentiment": "Positive",
            "mentions": counts["Positive"]
        })

    if counts["Negative"]:
        themes.append({
            "name": "Negative keywords",
            "sentiment": "Negative",
            "mentions": counts["Negative"]
        })

    if counts["Neutral"]:
        themes.append({
            "name": "Neutral feedback",
            "sentiment": "Neutral",
            "mentions": counts["Neutral"]
        })

    return {
        "results": results,
        "summary": summary,
        "themes": themes,
        "mode": "simulation"
    }


def analyze_reviews(reviews):
    if not API_URL or not API_KEY or not MODEL:
        return simulate_reviews(reviews)

    prompt = f"""
Analyze the sentiment of each product review.

For every review:
- Sentiment must be Positive, Negative, or Neutral.
- Confidence must be a number from 0 to 100.
- Explanation must briefly explain the classification.

Return ONLY valid JSON in this structure:

{{
  "results": [
    {{
      "review": "review text",
      "sentiment": "Positive",
      "confidence": 95,
      "explanation": "Brief explanation"
    }}
  ],
  "summary": "Short summary of the overall feedback",
  "themes": [
    {{
      "name": "Theme name",
      "sentiment": "Positive",
      "mentions": 1
    }}
  ]
}}

Reviews:
{json.dumps(reviews, ensure_ascii=False)}
"""

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a product review sentiment analysis assistant. "
                    "Return strictly valid JSON without markdown."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.2
    }

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(
        API_URL,
        headers=headers,
        json=payload,
        timeout=60
    )

    response.raise_for_status()

    data = response.json()
    content = data["choices"][0]["message"]["content"]

        # Handle JSON returned directly or inside Markdown code fences.
    content = content.strip()

    if content.startswith("```"):
        content = re.sub(
            r"^```(?:json)?\s*|\s*```$",
            "",
            content,
            flags=re.IGNORECASE
        ).strip()

    try:
        parsed = json.loads(content)
    except json.JSONDecodeError:
        # Attempt to extract a JSON object from surrounding text.
        match = re.search(r"\{.*\}", content, flags=re.DOTALL)

        if not match:
            raise ValueError("The AI returned invalid JSON.")

        parsed = json.loads(match.group(0))

    if not isinstance(parsed, dict):
        raise ValueError("Unexpected AI response format.")

    results = parsed.get("results")

    if not isinstance(results, list) or len(results) != len(reviews):
        raise ValueError("Invalid AI classification results.")

    for result, original_review in zip(results, reviews):
        if not isinstance(result, dict):
            raise ValueError("Invalid classification entry.")

        if result.get("review") != original_review:
            raise ValueError("Review mismatch in AI response.")

        if result.get("sentiment") not in {
            "Positive", "Negative", "Neutral"
        }:
            raise ValueError("Invalid sentiment label.")

        confidence = result.get("confidence")

        if (
            isinstance(confidence, bool)
            or not isinstance(confidence, (int, float))
            or not 0 <= confidence <= 100
        ):
            raise ValueError("Invalid confidence value.")

        if not isinstance(result.get("explanation"), str):
            raise ValueError("Invalid explanation.")

    if not isinstance(parsed.get("summary"), str):
        raise ValueError("Invalid summary.")

    if not isinstance(parsed.get("themes"), list):
        raise ValueError("Invalid themes.")

    parsed["mode"] = "ai"

    return parsed