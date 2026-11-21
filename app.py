
import requests

from flask import Flask, jsonify, render_template, request
from dotenv import load_dotenv

from services.sentiment_service import analyze_reviews

load_dotenv()

app = Flask(__name__)

MAX_REVIEWS = 50
MAX_REVIEW_LENGTH = 2000


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Please submit valid JSON data."}), 400

    reviews = data.get("reviews")

    if not isinstance(reviews, list):
        return jsonify({"error": "Reviews must be provided as a list."}), 400

    if not reviews:
        return jsonify({"error": "Please enter at least one review."}), 400

    if len(reviews) > MAX_REVIEWS:
        return jsonify({
            "error": f"You can analyze up to {MAX_REVIEWS} reviews at a time."
        }), 400

    cleaned_reviews = []

    for review in reviews:
        if not isinstance(review, str):
            return jsonify({"error": "Each review must be text."}), 400

        review = review.strip()

        if not review:
            return jsonify({"error": "Reviews cannot be empty."}), 400

        if len(review) > MAX_REVIEW_LENGTH:
            return jsonify({
                "error": f"Each review must be under {MAX_REVIEW_LENGTH} characters."
            }), 400

        cleaned_reviews.append(review)

    try:
        result = analyze_reviews(cleaned_reviews)
        return jsonify(result), 200

    except requests.exceptions.Timeout:
        return jsonify({
            "error": "The AI service timed out. Please try again."
        }), 504

    except requests.exceptions.RequestException:
        app.logger.exception("AI provider request failed")

        return jsonify({
            "error": "The AI provider could not be reached. Please try again."
        }), 502

    except Exception:
        app.logger.exception("Sentiment analysis failed")

        return jsonify({
            "error": "Unable to analyze reviews right now. Please try again."
        }), 502


if __name__ == "__main__":
    app.run(debug=False)
