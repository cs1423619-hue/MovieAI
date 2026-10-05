# MovieAI

MovieAI is a production-style movie discovery and AI recommendation platform built with React + Vite on the frontend and FastAPI on the backend. It uses live TMDB data, secure authentication, watchlists, ratings, and a TF-IDF + cosine similarity engine for personalized recommendations.

## Stack
- Frontend: React, Vite, Tailwind CSS
- Backend: FastAPI, SQLAlchemy, JWT auth
- Data source: TMDB API
- Recommendation engine: content-based TF-IDF + cosine similarity
- Database: PostgreSQL-ready with SQLite fallback for local development

## Features
- Trending, latest, upcoming, and top-rated movie sections
- Language and genre-based movie browsing
- Global movie/person search
- Movie detail page with similar movie suggestions
- User authentication
- Watchlist and rating APIs
- Personalized AI recommendations based on preferences, watched movies, and ratings
- Responsive premium UI

## Setup

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env
# Fill in values in ../.env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Important
- Never expose TMDB API key in frontend code.
- Backend reads TMDB credentials from environment variables.
- The app is designed to work with a PostgreSQL database in production while falling back to SQLite locally when needed.
