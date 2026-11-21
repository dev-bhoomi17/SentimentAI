
const elements = {
    reviewInput: document.getElementById("reviewInput"),
    reviewCount: document.getElementById("reviewCount"),
    characterCount: document.getElementById("characterCount"),
    analyzeButton: document.getElementById("analyzeButton"),
    clearInputButton: document.getElementById("clearInputButton"),
    loadDemoButton: document.getElementById("loadDemoButton"),
    clearButton: document.getElementById("clearButton"),
    exportButton: document.getElementById("exportButton"),
    errorMessage: document.getElementById("errorMessage"),

    totalMetric: document.getElementById("totalMetric"),
    positiveMetric: document.getElementById("positiveMetric"),
    negativeMetric: document.getElementById("negativeMetric"),
    neutralMetric: document.getElementById("neutralMetric"),

    positiveCount: document.getElementById("positiveCount"),
    negativeCount: document.getElementById("negativeCount"),
    neutralCount: document.getElementById("neutralCount"),

    legendPositive: document.getElementById("legendPositive"),
    legendNegative: document.getElementById("legendNegative"),
    legendNeutral: document.getElementById("legendNeutral"),

    resultsSubtitle: document.getElementById("resultsSubtitle"),
    summaryContent: document.getElementById("summaryContent"),
    themesContainer: document.getElementById("themesContainer"),

    searchInput: document.getElementById("searchInput"),
    filterGroup: document.getElementById("filterGroup"),
    reviewList: document.getElementById("reviewList"),
    reviewTotalPill: document.getElementById("reviewTotalPill"),
    paginationContainer: document.getElementById("paginationContainer"),

    chartCanvas: document.getElementById("sentimentChart")
};

/* ---------------------------
   DEMO DATA
---------------------------- */

const DEMO_REVIEWS = [
    {
        text: "The headphones sound incredible and the battery lasts all day. Definitely worth the money!",
        sentiment: "positive",
        explanation: "The reviewer expresses strong satisfaction with sound quality, battery life and value.",
        confidence: 0.97
    },
    {
        text: "The delivery was delayed by almost a week and customer support was not helpful.",
        sentiment: "negative",
        explanation: "The reviewer reports a delivery delay and an unsatisfactory support experience.",
        confidence: 0.95
    },
    {
        text: "The product arrived in a standard box with the charger and manual.",
        sentiment: "neutral",
        explanation: "The review mainly describes the contents received without expressing a clear opinion.",
        confidence: 0.91
    },
    {
        text: "Excellent build quality! It feels premium and works exactly as advertised.",
        sentiment: "positive",
        explanation: "The reviewer praises build quality and confirms that the product meets expectations.",
        confidence: 0.96
    },
    {
        text: "The screen is good, but the battery drains too quickly and it gets hot.",
        sentiment: "negative",
        explanation: "The reviewer mentions battery drain and overheating, outweighing the positive screen comment.",
        confidence: 0.89
    },
    {
        text: "The price is reasonable for the features it offers.",
        sentiment: "positive",
        explanation: "The reviewer positively evaluates the product's value for money.",
        confidence: 0.93
    },
    {
        text: "I received the black version, as ordered.",
        sentiment: "neutral",
        explanation: "The review states an order detail without a clear positive or negative opinion.",
        confidence: 0.90
    },
    {
        text: "The app keeps crashing and setup was extremely frustrating.",
        sentiment: "negative",
        explanation: "The reviewer reports repeated software problems and frustration during setup.",
        confidence: 0.96
    },
    {
        text: "Very comfortable to use. The design is thoughtful and the buttons are responsive.",
        sentiment: "positive",
        explanation: "The reviewer highlights comfort, design and responsive controls.",
        confidence: 0.94
    },
    {
        text: "The package contains two accessories and a USB cable.",
        sentiment: "neutral",
        explanation: "The review provides product-package information without expressing sentiment.",
        confidence: 0.88
    },
    {
        text: "The material feels cheap and the product stopped working after a few days.",
        sentiment: "negative",
        explanation: "The reviewer expresses dissatisfaction with the material and reliability.",
        confidence: 0.98
    },
    {
        text: "I love this purchase. It is easy to use and performs better than expected.",
        sentiment: "positive",
        explanation: "The reviewer expresses satisfaction with usability and performance.",
        confidence: 0.97
    }
];

let reviews = [];
let activeFilter = "all";
let currentPage = 1;
let chartInstance = null;

let aiSummary = null;
let aiThemes = null;

const PAGE_SIZE = 5;

const sentimentLabels = {
    positive: "Positive",
    negative: "Negative",
    neutral: "Neutral"
};

const sentimentSymbols = {
    positive: "↗",
    negative: "↘",
    neutral: "◉"
};

/* ---------------------------
   INPUT UTILITIES
---------------------------- */

function updateInputCounters() {
    const text = elements.reviewInput.value;
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

    elements.reviewCount.textContent =
        `${lines.length} ${lines.length === 1 ? "review" : "reviews"}`;

    elements.characterCount.textContent =
        `${text.length.toLocaleString()} / 10,000 characters`;
}

function clearInput() {
    elements.reviewInput.value = "";
    updateInputCounters();
    hideError();
}

function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.classList.add("visible");
}

function hideError() {
    elements.errorMessage.textContent = "";
    elements.errorMessage.classList.remove("visible");
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

function percentage(count, total) {
    if (!total) return 0;
    return Math.round((count / total) * 100);
}

/* ---------------------------
   DEMO DATA
---------------------------- */

function loadDemoData() {
    reviews = DEMO_REVIEWS.map((review, index) => ({
        ...review,
        id: index + 1
    }));

    aiSummary = null;
    aiThemes = null;

    activeFilter = "all";
    currentPage = 1;

    elements.searchInput.value = "";
    setActiveFilter("all");

    renderDashboard();

    elements.resultsSubtitle.textContent =
        "Sample dataset · 12 product reviews";

    hideError();

    document.getElementById("resultsSection").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

/* ---------------------------
   SENTIMENT COUNTS
---------------------------- */

function getSentimentCounts(data = reviews) {
    return {
        positive: data.filter(review => review.sentiment === "positive").length,
        negative: data.filter(review => review.sentiment === "negative").length,
        neutral: data.filter(review => review.sentiment === "neutral").length
    };
}

/* ---------------------------
   DASHBOARD METRICS
---------------------------- */

function updateMetrics() {
    const counts = getSentimentCounts();
    const total = reviews.length;

    elements.totalMetric.textContent = total.toLocaleString();

    elements.positiveMetric.textContent =
        `${percentage(counts.positive, total)}%`;

    elements.negativeMetric.textContent =
        `${percentage(counts.negative, total)}%`;

    elements.neutralMetric.textContent =
        `${percentage(counts.neutral, total)}%`;

    elements.positiveCount.textContent =
        `${counts.positive} ${counts.positive === 1 ? "review" : "reviews"}`;

    elements.negativeCount.textContent =
        `${counts.negative} ${counts.negative === 1 ? "review" : "reviews"}`;

    elements.neutralCount.textContent =
        `${counts.neutral} ${counts.neutral === 1 ? "review" : "reviews"}`;

    elements.legendPositive.textContent = counts.positive;
    elements.legendNegative.textContent = counts.negative;
    elements.legendNeutral.textContent = counts.neutral;

    elements.reviewTotalPill.textContent =
        `${total} ${total === 1 ? "review" : "reviews"}`;

    elements.exportButton.disabled = total === 0;
}

/* ---------------------------
   CHART
---------------------------- */

function createChart() {
    const counts = getSentimentCounts();

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(elements.chartCanvas, {
        type: "doughnut",

        data: {
            labels: ["Positive", "Negative", "Neutral"],
            datasets: [{
                data: [
                    counts.positive,
                    counts.negative,
                    counts.neutral
                ],
                backgroundColor: [
                    "#399473",
                    "#dc7858",
                    "#8192c5"
                ],
                borderWidth: 4,
                borderColor: "#ffffff",
                hoverOffset: 8,
                borderRadius: 5
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "72%",

            animation: {
                duration: 900,
                easing: "easeOutQuart"
            },

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    backgroundColor: "#164e46",
                    padding: 12,
                    cornerRadius: 10,
                    titleFont: {
                        family: "DM Sans",
                        size: 12
                    },
                    bodyFont: {
                        family: "DM Sans",
                        size: 11
                    },
                    displayColors: true
                }
            }
        }
    });
}

/* ---------------------------
   AI SUMMARY
---------------------------- */

function updateSummary() {
    const counts = getSentimentCounts();
    const total = reviews.length;

    if (!total) {
        elements.summaryContent.innerHTML = `
            <div class="empty-insight">
                <div class="empty-insight-icon">✧</div>
                <p>Your AI summary will appear here after analyzing reviews.</p>
            </div>
        `;
        return;
    }

    if (aiSummary) {
        elements.summaryContent.innerHTML = `
            <div class="insight-text">
                ${escapeHTML(aiSummary)}
            </div>
        `;
        return;
    }

    const positivePct = percentage(counts.positive, total);
    const negativePct = percentage(counts.negative, total);
    const neutralPct = percentage(counts.neutral, total);

    let message = "";

    if (counts.positive > counts.negative && counts.positive > counts.neutral) {
        message = `
            Customers are predominantly positive, with
            <strong>${positivePct}%</strong> of reviews expressing satisfaction.
            Explore positive feedback to identify strengths worth maintaining.
        `;
    } else if (
        counts.negative > counts.positive &&
        counts.negative > counts.neutral
    ) {
        message = `
            Negative feedback is the largest sentiment group at
            <strong>${negativePct}%</strong>.
            Review recurring concerns to identify areas that may need improvement.
        `;
    } else if (
        counts.neutral >= counts.positive &&
        counts.neutral >= counts.negative
    ) {
        message = `
            Neutral feedback represents
            <strong>${neutralPct}%</strong> of reviews.
            Consider gathering more detailed feedback to understand customer preferences.
        `;
    } else {
        message = `
            Feedback is mixed across sentiment categories.
            <strong>${positivePct}%</strong> positive,
            <strong>${negativePct}%</strong> negative and
            <strong>${neutralPct}%</strong> neutral.
            Explore the reviews to understand the different experiences.
        `;
    }

    elements.summaryContent.innerHTML = `
        <div class="insight-text">${message}</div>
    `;
}

/* ---------------------------
   THEME DETECTION
   Keyword fallback for demo data
---------------------------- */

const THEME_KEYWORDS = {
    "Battery": ["battery", "charging", "charge"],
    "Delivery": ["delivery", "delayed", "shipping", "arrived"],
    "Quality": ["quality", "material", "build", "durability"],
    "Performance": ["performance", "working", "works", "crashing", "speed"],
    "Price & Value": ["price", "money", "worth", "value", "cost"],
    "Usability": ["comfortable", "easy", "setup", "design", "buttons"],
    "Customer Support": ["support", "service", "helpful"]
};

function detectThemes() {
    const themeCounts = {};

    for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
        const matchedReviews = reviews.filter(review => {
            const text = review.text.toLowerCase();
            return keywords.some(keyword => text.includes(keyword));
        });

        if (matchedReviews.length > 0) {
            themeCounts[theme] = {
                count: matchedReviews.length,
                negative: matchedReviews.filter(
                    review => review.sentiment === "negative"
                ).length
            };
        }
    }

    return themeCounts;
}

function renderThemes() {
    // Use AI-generated themes when available
    if (aiThemes && aiThemes.length > 0) {
        elements.themesContainer.innerHTML = aiThemes
            .sort((a, b) => b.mentions - a.mentions)
            .map(theme => `
                <div class="theme-chip ${
                    theme.sentiment.toLowerCase() === "negative"
                        ? "negative-theme"
                        : ""
                }">
                    <span class="theme-chip-name">
                        ${escapeHTML(theme.name)}
                    </span>
                    <span class="theme-chip-count">
                        ${theme.mentions}
                    </span>
                </div>
            `)
            .join("");

        return;
    }

    // Fall back to keyword-based themes for demo data
    const themes = detectThemes();

    if (!Object.keys(themes).length) {
        elements.themesContainer.innerHTML = `
            <div class="themes-empty">
                <span>✧</span>
                <p>Product themes will appear after analysis.</p>
            </div>
        `;
        return;
    }

    elements.themesContainer.innerHTML = Object.entries(themes)
        .sort((a, b) => b[1].count - a[1].count)
        .map(([theme, data]) => `
            <div class="theme-chip ${data.negative > 0 ? "negative-theme" : ""}">
                <span class="theme-chip-name">${escapeHTML(theme)}</span>
                <span class="theme-chip-count">${data.count}</span>
            </div>
        `)
        .join("");
}

/* ---------------------------
   REVIEW FILTERING
---------------------------- */

function setActiveFilter(filter) {
    activeFilter = filter;

    const buttons = elements.filterGroup.querySelectorAll(".filter-button");

    buttons.forEach(button => {
        button.classList.toggle("active", button.dataset.filter === filter);
    });
}

function getFilteredReviews() {
    const searchTerm = elements.searchInput.value.trim().toLowerCase();

    return reviews.filter(review => {
        const matchesSentiment =
            activeFilter === "all" || review.sentiment === activeFilter;

        const matchesSearch =
            !searchTerm || review.text.toLowerCase().includes(searchTerm);

        return matchesSentiment && matchesSearch;
    });
}

/* ---------------------------
   REVIEW CARDS
---------------------------- */

function renderReviewCards() {
    const filteredReviews = getFilteredReviews();
    const totalPages = Math.max(1, Math.ceil(filteredReviews.length / PAGE_SIZE));

    currentPage = Math.min(currentPage, totalPages);

    const startIndex = (currentPage - 1) * PAGE_SIZE;

    const pageReviews = filteredReviews.slice(
        startIndex,
        startIndex + PAGE_SIZE
    );

    if (!pageReviews.length) {
        elements.reviewList.innerHTML = `
            <div class="reviews-empty">
                <div class="reviews-empty-icon">⌕</div>
                <h4>No matching reviews</h4>
                <p>Try another search term or sentiment filter.</p>
            </div>
        `;

        elements.paginationContainer.innerHTML = "";
        return;
    }

    elements.reviewList.innerHTML = pageReviews.map(review => `
        <article class="review-card">
            <div class="review-card-top">
                <p class="review-text">${escapeHTML(review.text)}</p>

                <span class="sentiment-badge ${review.sentiment}">
                    ${sentimentSymbols[review.sentiment]}
                    ${sentimentLabels[review.sentiment]}
                </span>
            </div>

            <div class="review-card-footer">
                <p class="review-explanation">
                    ${escapeHTML(review.explanation)}
                </p>

                <span class="confidence-pill">
                    Confidence: ${Math.round(review.confidence * 100)}%
                </span>
            </div>
        </article>
    `).join("");

    renderPagination(totalPages);
}

/* ---------------------------
   PAGINATION
---------------------------- */

function renderPagination(totalPages) {
    if (totalPages <= 1) {
        elements.paginationContainer.innerHTML = "";
        return;
    }

    let buttons = "";

    buttons += `
        <button class="page-button" data-page="prev"
            ${currentPage === 1 ? "disabled" : ""}>
            ‹
        </button>
    `;

    for (let page = 1; page <= totalPages; page++) {
        buttons += `
            <button class="page-button ${page === currentPage ? "active" : ""}"
                data-page="${page}">
                ${page}
            </button>
        `;
    }

    buttons += `
        <button class="page-button" data-page="next"
            ${currentPage === totalPages ? "disabled" : ""}>
            ›
        </button>
    `;

    elements.paginationContainer.innerHTML = buttons;
}

/* ---------------------------
   CSV EXPORT
---------------------------- */

function exportCSV() {
    if (!reviews.length) return;

    const headers = [
        "Review",
        "Sentiment",
        "Explanation",
        "Confidence"
    ];

    const rows = reviews.map(review => [
        review.text,
        review.sentiment,
        review.explanation,
        Math.round(review.confidence * 100) + "%"
    ]);

    const csv = [headers, ...rows]
        .map(row => row.map(value => {
            const safeValue = String(value).replace(/"/g, '""');
            return `"${safeValue}"`;
        }).join(","))
        .join("\r\n");

    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "sentiment-analysis-results.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

/* ---------------------------
   RESET
---------------------------- */

function clearDashboard() {
    reviews = [];
    aiSummary = null;
    aiThemes = null;

    activeFilter = "all";
    currentPage = 1;

    elements.searchInput.value = "";
    elements.reviewInput.value = "";

    updateInputCounters();
    hideError();

    setActiveFilter("all");

    elements.resultsSubtitle.textContent =
        "Analyze reviews to see the sentiment breakdown.";

    updateMetrics();
    createChart();
    updateSummary();
    renderThemes();
    renderReviewCards();

    elements.exportButton.disabled = true;
}

/* ---------------------------
   DASHBOARD RENDERER
---------------------------- */

function renderDashboard() {
    updateMetrics();
    createChart();
    updateSummary();
    renderThemes();
    renderReviewCards();
}

/* ---------------------------
   AI ANALYSIS
---------------------------- */

async function analyzeReviews() {
    hideError();

    const rawText = elements.reviewInput.value;
    const inputReviews = rawText
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

    if (!inputReviews.length) {
        showError("Please enter at least one product review.");
        return;
    }

    if (rawText.length > 10000) {
        showError("Your input exceeds the 10,000 character limit.");
        return;
    }

    if (inputReviews.length > 50) {
        showError("You can analyze up to 50 reviews at a time.");
        return;
    }

    if (inputReviews.some(review => review.length > 2000)) {
        showError("Each review must be under 2,000 characters.");
        return;
    }

    const originalButtonText = elements.analyzeButton.textContent;

    elements.analyzeButton.disabled = true;
    elements.analyzeButton.textContent = "Analyzing reviews...";

    try {
        const response = await fetch("/api/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                reviews: inputReviews
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "The analysis request failed."
            );
        }

        if (!Array.isArray(data.results)) {
            throw new Error("The AI returned an unexpected response.");
        }

        reviews = data.results.map((result, index) => ({
            id: index + 1,
            text: result.review,
            sentiment: result.sentiment.toLowerCase(),
            explanation: result.explanation,
            confidence: result.confidence / 100
        }));

        aiSummary = data.summary || null;
        aiThemes = Array.isArray(data.themes) ? data.themes : null;

        activeFilter = "all";
        currentPage = 1;

        elements.searchInput.value = "";
        setActiveFilter("all");

        renderDashboard();

        elements.resultsSubtitle.textContent =
    `${data.mode === "simulation" ? "SIMULATION MODE · " : "AI analysis · "}${reviews.length} product reviews`;

        document.getElementById("resultsSection").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        clearInput();
    } catch (error) {
        showError(error.message || "Unable to analyze reviews right now.");
    } finally {
        elements.analyzeButton.disabled = false;
        elements.analyzeButton.textContent = originalButtonText;
    }
}

/* ---------------------------
   EVENTS
---------------------------- */

elements.reviewInput.addEventListener("input", updateInputCounters);

elements.clearInputButton.addEventListener("click", clearInput);

elements.loadDemoButton.addEventListener("click", loadDemoData);

elements.clearButton.addEventListener("click", clearDashboard);

elements.exportButton.addEventListener("click", exportCSV);

elements.searchInput.addEventListener("input", () => {
    currentPage = 1;
    renderReviewCards();
});

elements.filterGroup.addEventListener("click", event => {
    const button = event.target.closest(".filter-button");

    if (!button) return;

    setActiveFilter(button.dataset.filter);
    currentPage = 1;
    renderReviewCards();
});

elements.paginationContainer.addEventListener("click", event => {
    const button = event.target.closest(".page-button");

    if (!button || button.disabled) return;

    if (button.dataset.page === "prev") {
        currentPage--;
    } else if (button.dataset.page === "next") {
        currentPage++;
    } else {
        currentPage = Number(button.dataset.page);
    }

    renderReviewCards();
});

elements.analyzeButton.addEventListener("click", analyzeReviews);

document.querySelectorAll("[data-nav]").forEach(link => {
    link.addEventListener("click", () => {
        document.querySelectorAll("[data-nav]").forEach(item => {
            item.classList.remove("active");
        });

        link.classList.add("active");
    });
});

/* ---------------------------
   INITIALIZATION
---------------------------- */

function initializeDashboard() {
    updateInputCounters();

    reviews = [];
    aiSummary = null;
    aiThemes = null;

    activeFilter = "all";
    currentPage = 1;

    setActiveFilter("all");

    renderDashboard();
}

initializeDashboard();
