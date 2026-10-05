# MovieAI

A full-stack movie discovery and recommendation platform powered by TMDB, FastAPI, React, and ML-based recommendations.

## Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: FastAPI + SQLAlchemy
- Data: TMDB API
- Recommendations: TF-IDF + cosine similarity
- Auth: JWT + bcrypt
- Database: PostgreSQL-ready with SQLite fallback

## Local setup

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Backend endpoints
- /api/health
- /api/movies/trending
- /api/movies/latest
- /api/movies/top-rated
- /api/movies/upcoming
- /api/movies/language/{language}
- /api/movies/genre/{genre}
- /api/movies/search
- /api/movies/{tmdb_id}
- /api/movies/{tmdb_id}/recommendations
- /api/auth/register
- /api/auth/login
- /api/profile
- /api/watchlist
- /api/ratings
- /api/recommendations

## Important
TMDB API keys must stay in the backend environment only. Never expose them in frontend code.
