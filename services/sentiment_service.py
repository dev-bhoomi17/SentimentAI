
import json
import os

import requests


API_URL = os.getenv("AI_API_URL", "").strip()
API_KEY = os.getenv("AI_API_KEY", "").strip()
MODEL = os.getenv("AI_MODEL", "").strip()


def analyze_reviews(reviews):
    if not API_URL or not API_KEY or not MODEL:
        raise RuntimeError("AI API configuration is missing.")

    prompt = f"""
Analyze the sentiment of each product review.

Classify each review as exactly one of:
Positive, Negative, or Neutral.

For each review, return:
- review: the original review
- sentiment: Positive, Negative, or Neutral
- confidence: a number between 0 and 100
- explanation: a short explanation

Also provide:
- summary: a concise overall summary of the reviews
- themes: a list of recurring product-related themes

Return valid JSON only in this structure:
{{
    "results": [
        {{
            "review": "original review",
            "sentiment": "Positive",
            "confidence": 90,
            "explanation": "short explanation"
        }}
    ],
    "summary": "overall summary",
    "themes": [
        {{
            "name": "theme name",
            "sentiment": "Positive",
            "mentions": 2
        }}
    ]
}}

Reviews:
{json.dumps(reviews, ensure_ascii=False)}
"""

    response = requests.post(
        API_URL,
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a product review sentiment analysis assistant. Return JSON only.",
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            "temperature": 0.2,
        },
        timeout=60,
    )

    response.raise_for_status()
    data = response.json()

    content = data["choices"][0]["message"]["content"]

    if not isinstance(content, str):
        raise ValueError("Unexpected AI response format.")

    parsed = json.loads(content)

    validate_response(parsed, reviews)

    return parsed


def validate_response(data, reviews):
    if not isinstance(data, dict):
        raise ValueError("AI response must be a JSON object.")

    results = data.get("results")

    if not isinstance(results, list) or len(results) != len(reviews):
        raise ValueError("AI returned an invalid number of results.")

    allowed_sentiments = {"Positive", "Negative", "Neutral"}

    for result in results:
        if not isinstance(result, dict):
            raise ValueError("Invalid review result.")

        if result.get("sentiment") not in allowed_sentiments:
            raise ValueError("Invalid sentiment classification.")

        if not isinstance(result.get("review"), str):
            raise ValueError("Invalid review text.")

        if not isinstance(result.get("explanation"), str):
            raise ValueError("Invalid explanation.")

        confidence = result.get("confidence")

        if (
            not isinstance(confidence, (int, float))
            or isinstance(confidence, bool)
            or not 0 <= confidence <= 100
        ):
            raise ValueError("Invalid confidence value.")

    if not isinstance(data.get("summary"), str):
        raise ValueError("Invalid summary.")

    if not isinstance(data.get("themes"), list):
        raise ValueError("Invalid themes.")

    for theme in data["themes"]:
        if not isinstance(theme, dict):
            raise ValueError("Invalid theme format.")

        if not isinstance(theme.get("name"), str):
            raise ValueError("Invalid theme name.")

        if theme.get("sentiment") not in allowed_sentiments:
            raise ValueError("Invalid theme sentiment.")

        mentions = theme.get("mentions")

        if (
            not isinstance(mentions, int)
            or isinstance(mentions, bool)
            or mentions < 0
        ):
            raise ValueError("Invalid theme mention count.")
