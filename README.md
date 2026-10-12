# 🌿 FloraAI — Production AI-Powered Plant Care Assistant

FloraAI is a production-oriented, full-stack botanical application designed to help beginners, gardeners, plant enthusiasts, and farmers identify plants, detect leaf diseases and pests, receive customized care schedules, and consult an AI Plant Doctor.

---

## 🌟 Key Features

1. **AI Plant Identification ("Scan Plant")**
   - High-confidence botanical species identification using **Google Gemini Vision** or internal botanical knowledge engine.
   - Comprehensive taxonomic profiles: Common Name, Scientific Name, Family, Light exposure, Soil mix ratios, Watering cadence, and Pet Toxicity warnings.
   - One-click **"Save to My Garden"** button that automatically pre-populates recurring watering and care schedules.

2. **AI Plant Disease Diagnosis & Pathology**
   - Upload photographs of affected leaves, stems, flowers, fruit, or roots.
   - User context submission: species, age, environment (indoor/outdoor), watering habits, and symptoms description.
   - Preliminary diagnostic report detailing probable conditions, severity level (Low to Severe), and contributing factors.
   - **Safety-First**: Non-chemical cultural adjustments and organic bio-controls prioritized over synthetic pesticides; clear isolation recommendations and agricultural extension guidelines.

3. **Personal Digital Garden ("My Plants")**
   - Filter and search by category (*Indoor, Outdoor, Succulents, Herbs, Vegetables, Flowers, Tropical*), health status (*Healthy, Needs Attention, Recovering, Diseased*), or name.
   - Grid and List views with plant photos, locations, and health badges.
   - Detailed individual plant profiles with Care Specifications, Active Schedules, Growth Milestones, and Care History.

4. **Smart Care Reminders & Calendar**
   - Adaptive scheduling for **Watering**, **Fertilizing**, **Pruning**, **Repotting**, and **Pest Inspection**.
   - One-click task completion automatically generates an immutable care log and reschedules the next due date based on the repeat rule.
   - Snooze controls (+1 day, +2 days, +1 week).
   - In-app notification center and desktop web push notification support.
   - Monthly and weekly interactive **Plant Care Calendar** synced directly to database records.

5. **AI Plant Doctor Chatbot**
   - Interactive conversational assistant powered by Google Gemini.
   - **Plant Context Aware**: Consult regarding a specific plant in your garden or ask general horticulture questions.
   - Follow-up query suggestions, copy response button, and typing indicators.

6. **Growth Tracking & Health Timeline**
   - Record height in centimeters or inches, leaf count milestones, observations, and progress photos.
   - Visual growth progression timeline.

7. **Botanical Learning Center & Encyclopedia**
   - Curated guides categorized into Indoor Plants, Succulents, Plant Diseases, Soil Science, and Propagation.
   - Step-by-step instructions and troubleshooting guides with difficulty levels.

8. **User Privacy & Account Governance**
   - JWT authentication with secure password hashing (`bcrypt`).
   - One-click JSON data export of all garden records, care logs, and diagnoses.
   - Account deletion workflow.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4 with botanical tokens (`#245C43`, `#69A86B`, `#F7F8F2`), Lucide Icons, Canvas Confetti.
- **Backend**: Python 3.13, FastAPI, SQLAlchemy ORM, Pydantic v2, PyJWT, Bcrypt, HTTPX, Pillow, Pytest.
- **Database**: SQLite (zero-setup local default) or PostgreSQL / Supabase with Row-Level Security readiness.
- **AI Vision & Chat**: Google Gemini API (`gemini-1.5-flash`), with resilient fallback to FloraAI Botanical Knowledge Engine when offline.

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# (Optional) Create and activate a virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Copy .env.example to .env
copy .env.example .env   # (Windows)
# cp .env.example .env   # (Linux/macOS)

# Start backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend starts at `http://127.0.0.1:8000`.
- Interactive Swagger API docs: `http://127.0.0.1:8000/docs`
- ReDoc documentation: `http://127.0.0.1:8000/redoc`
- System health: `http://127.0.0.1:8000/api/health`

### 3. Frontend Setup

In a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install packages
npm install

# Start Vite dev server
npm run dev
```

The web application opens at `http://localhost:3000`.

---

## 🔑 AI Provider Configuration (Google Gemini)

To enable live Vision analysis and live Gemini chat:

1. Obtain a free Google Gemini API key at: [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Open `backend/.env` and insert your key:
   ```env
   GEMINI_API_KEY=AIzaSy...your-gemini-key...
   GEMINI_MODEL=gemini-1.5-flash
   ```
3. Restart the backend server. The app header will automatically display:
   `✨ Gemini 1.5 Flash Vision`.

> **Note:** If `GEMINI_API_KEY` is not provided, FloraAI seamlessly runs in **Intelligent Botanical Engine Mode**, allowing complete testing and offline usage with zero broken screens.

---

## 👤 Pre-Seeded Demo Account

For rapid evaluation, the database is pre-seeded with a demo user and collection:
- **Email**: `demo@floraai.com`
- **Password**: `FloraPassword123!`
- Or simply click **"Explore as Demo User"** on the Login screen!

You can also register a fresh user account at any time.

---

## 🧪 Automated Testing

To run the backend integration test suite covering authentication, plant CRUD, reminders, dashboard stats, articles, and AI chat:

```bash
cd backend
python -m pytest tests/test_api.py -v
```

To verify the frontend TypeScript and production build:

```bash
cd frontend
npm run build
```

---

## 🗄️ Database Architecture

The normalized schema includes:
- `users`: Credentials, settings, preferred units, time zone.
- `plants`: Botanical metadata, location, environment, health status, care specs.
- `care_reminders`: Due dates, repeat intervals, completion status.
- `care_logs`: History of all care actions performed.
- `plant_identifications`: Image URLs, confidence, taxonomy, care metrics.
- `plant_diagnoses`: Symptoms, condition analysis, organic remedies, quarantine flags.
- `growth_records`: Height tracking, leaf count, milestone observations, photos.
- `chat_conversations` & `chat_messages`: Contextual doctor conversations.
- `notifications`: Care alerts, overdue notices, system updates.
- `articles`: Botanical care encyclopedia and troubleshooting guides.

A raw SQL migration script for Supabase / PostgreSQL is available at:
`database/migrations/001_initial_schema.sql`.
