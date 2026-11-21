# SentimentAI — Product Review Sentiment Dashboard

SentimentAI is a web-based sentiment analysis dashboard designed to analyze customer product reviews, classify their sentiment, and present insights through an interactive visualization dashboard.

The application supports bulk review analysis, sentiment classification, confidence scores, sentiment summaries, and theme detection.

## 🌐 Live Demo

**Live Application:** https://sentimentai-12ph.onrender.com

**GitHub Repository:** https://github.com/dev-bhoomi17/SentimentAI

---

## ✨ Features

- **Bulk Review Analysis** — Analyze multiple product reviews in a single request.
- **Sentiment Classification** — Categorizes reviews into Positive, Negative, or Neutral.
- **Sentiment Dashboard** — Visualizes the sentiment distribution across analyzed reviews.
- **Confidence Scores** — Displays confidence scores for individual classifications.
- **Review Insights** — Generates summaries and identifies recurring review themes.
- **Input Validation** — Handles empty reviews, invalid requests, and oversized inputs.
- **Error Handling** — Handles backend errors, request failures, and unexpected responses.
- **Responsive Interface** — Dashboard designed for different screen sizes.
- **AI Integration Ready** — Backend supports a configurable AI API and structured JSON responses.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Python | Backend programming |
| Flask | Web framework and REST API |
| JavaScript | Frontend functionality |
| HTML5 | Webpage structure |
| CSS3 | Styling and responsive design |
| Requests | API communication |
| Gunicorn | Production server |
| Render | Application deployment |

---

## ⚙️ How It Works

1. The user enters one or more product reviews.
2. The frontend sends the reviews to the Flask backend.
3. The backend validates the input.
4. Reviews are processed through the configured sentiment analysis service.
5. The service returns structured classification results.
6. The frontend displays sentiment distribution, review classifications, summaries, and themes.

---

## 📊 Dashboard Insights

The dashboard presents:

- Sentiment distribution across reviews.
- Positive, negative, and neutral classifications.
- Individual review analysis.
- Confidence scores.
- Overall review summary.
- Common themes detected in the reviews.

---

## 🔌 API Documentation

### Analyze Reviews

**Endpoint:**

`POST /api/analyze`

**Request Content-Type:**

`application/json`

**Request Body:**

```json
{
  "reviews": [
    "This product is amazing!",
    "The quality is disappointing.",
    "It works as expected."
  ]
}
```

**Response:**

The API returns analysis results containing review classifications, confidence scores, summary information, detected themes, and the analysis mode.

The response structure includes:

- `results` — Individual review classifications.
- `summary` — Overall analysis summary.
- `themes` — Identified review themes.
- `mode` — Indicates whether the analysis is in simulation or AI mode.

**Validation:**

- Empty review lists are rejected.
- Invalid input formats are rejected.
- Reviews are limited to 2,000 characters each.
- Requests are limited to 50 reviews.

---

## 🚀 Local Installation

### 1. Clone the repository

```bash
git clone https://github.com/dev-bhoomi17/SentimentAI.git
cd SentimentAI
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate the virtual environment

**Windows:**

```powershell
venv\Scripts\activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure environment variables

Create a `.env` file in the project root.

```env
AI_API_URL=
AI_API_KEY=
AI_MODEL=
```

These variables are used for configuring a compatible AI service. The application currently supports simulation mode when AI configuration is unavailable.

Do not commit API keys or secret credentials to GitHub.

### 6. Run the application

```bash
python app.py
```

Open the application in your browser at:

`http://127.0.0.1:5000`

---

## 📁 Project Structure

```text
SentimentAI/
│
├── app.py
├── requirements.txt
├── .gitignore
│
├── services/
│   └── sentiment_service.py
│
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
│
└── templates/
    └── index.html
```

---

## ☁️ Deployment

The application is deployed using Render.

- **Platform:** Render
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn app:app`

Live URL: https://sentimentai-12ph.onrender.com

---

## ⚠️ Current Status

The application is publicly deployed and its dashboard and bulk analysis workflow are functional.

When AI API configuration is unavailable, the application uses a clearly labelled simulation mode for demonstration purposes.

The real generative AI response workflow is implemented to support a configurable compatible API, but its operation with a live model has not yet been verified.

---

## 🎯 Project Objectives

- Integrate a generative AI service into a full-stack web application.
- Design prompts that support structured, parseable output.
- Build a responsive sentiment analysis dashboard.
- Implement input validation and error handling.
- Deploy a full-stack application publicly.
- Apply secure practices for API credential management.

---

## 👩‍💻 Author

Developed as a full-stack AI application project.
