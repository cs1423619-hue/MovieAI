import json
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth_utils import create_access_token, hash_password, verify_password
from app.config import settings
from app.database import SessionLocal
from app.deps import get_current_user, get_db
from app.models import MovieRating, User, UserPreference, WatchlistItem
from app.schemas import PreferencesUpdate, RatingCreate, RatingOut, TokenResponse, UserLogin, UserOut, UserRegister, WatchlistItemOut
from app.services.recommendation import recommend_by_similarity, recommend_for_user
from app.services.tmdb_service import TMDBService

router = APIRouter()


def _serialize_user(user: User):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "favorite_languages": json.loads(user.favorite_languages or "[]"),
        "favorite_genres": json.loads(user.favorite_genres or "[]"),
        "created_at": user.created_at,
    }


@router.get("/health")
def health_check():
    return {"status": "ok", "message": "MovieAI backend is running"}


@router.get("/movies/trending")
def trending_movies(page: int = 1):
    try:
        return {"results": TMDBService.get_trending(page=page)}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Movie data temporarily unavailable: {str(exc)}")


@router.get("/movies/latest")
def latest_movies(page: int = 1):
    try:
        return {"results": TMDBService.get_latest(page=page)}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Movie data temporarily unavailable: {str(exc)}")


@router.get("/movies/top-rated")
def top_rated_movies(page: int = 1):
    try:
        return {"results": TMDBService.get_top_rated(page)}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Movie data temporarily unavailable: {str(exc)}")


@router.get("/movies/upcoming")
def upcoming_movies(page: int = 1):
    try:
        return {"results": TMDBService.get_upcoming(page)}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Movie data temporarily unavailable: {str(exc)}")


@router.get("/movies/language/{language}")
def language_movies(language: str, page: int = 1):
    try:
        return {"results": TMDBService.get_by_language(language, page)}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Movie data temporarily unavailable: {str(exc)}")


@router.get("/movies/genre/{genre_name}")
def genre_movies(genre_name: str, page: int = 1):
    try:
        return {"results": TMDBService.get_by_genre(genre_name, page)}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Movie data temporarily unavailable: {str(exc)}")


@router.get("/movies/search")
def search_movies(query: str = Query(..., min_length=1), page: int = 1):
    try:
        return {"results": TMDBService.search(query, page)}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Search is temporarily unavailable: {str(exc)}")


@router.get("/movies/{tmdb_id}")
def movie_details(tmdb_id: int):
    try:
        return TMDBService.get_movie_details(tmdb_id)
    except Exception as exc:
        raise HTTPException(status_code=404, detail=f"Movie not found or data unavailable: {str(exc)}")


@router.get("/movies/{tmdb_id}/recommendations")
def movie_recommendations(tmdb_id: int):
    try:
        target_movie = TMDBService.get_movie_details(tmdb_id)
        candidates = []
        for item in TMDBService.get_trending(1)[:20]:
            candidates.append(item)
        for item in TMDBService.get_top_rated(1)[:20]:
            candidates.append(item)
        similar = recommend_by_similarity(target_movie, candidates, top_n=8)
        return {"results": similar}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Recommendations are temporarily unavailable: {str(exc)}")


@router.post("/auth/register", response_model=TokenResponse)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists.")

    user = User(
        name=payload.name,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        favorite_languages="[]",
        favorite_genres="[]",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer"}


@router.post("/auth/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer"}


@router.get("/profile")
def profile(current_user: User = Depends(get_current_user)):
    return _serialize_user(current_user)


@router.put("/profile/preferences")
def update_preferences(payload: PreferencesUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.favorite_languages = json.dumps(payload.favorite_languages)
    current_user.favorite_genres = json.dumps(payload.favorite_genres)
    db.add(current_user)
    db.commit()
    return _serialize_user(current_user)


@router.get("/watchlist")
def list_watchlist(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = db.query(WatchlistItem).filter(WatchlistItem.user_id == current_user.id).order_by(WatchlistItem.added_at.desc()).all()
    return {"results": [
        {"id": item.id, "user_id": item.user_id, "tmdb_id": item.tmdb_id, "title": item.title, "poster_path": item.poster_path, "added_at": item.added_at}
        for item in items
    ]}


@router.post("/watchlist")
def add_watchlist_item(payload: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tmdb_id = payload.get("tmdb_id")
    title = payload.get("title")
    poster_path = payload.get("poster_path")
    if not tmdb_id:
        raise HTTPException(status_code=400, detail="tmdb_id is required")

    existing = db.query(WatchlistItem).filter(WatchlistItem.user_id == current_user.id, WatchlistItem.tmdb_id == int(tmdb_id)).first()
    if existing:
        return {"status": "already_exists"}

    item = WatchlistItem(user_id=current_user.id, tmdb_id=int(tmdb_id), title=title, poster_path=poster_path)
    db.add(item)
    db.commit()
    return {"status": "added"}


@router.delete("/watchlist/{tmdb_id}")
def remove_watchlist_item(tmdb_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(WatchlistItem).filter(WatchlistItem.user_id == current_user.id, WatchlistItem.tmdb_id == tmdb_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Movie not found in watchlist")
    db.delete(item)
    db.commit()
    return {"status": "removed"}


@router.get("/ratings")
def list_ratings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = db.query(MovieRating).filter(MovieRating.user_id == current_user.id).order_by(MovieRating.created_at.desc()).all()
    return {"results": [
        {"id": item.id, "user_id": item.user_id, "tmdb_id": item.tmdb_id, "movie_title": item.movie_title, "rating": item.rating, "created_at": item.created_at}
        for item in items
    ]}


@router.post("/ratings")
def add_rating(payload: RatingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(MovieRating).filter(MovieRating.user_id == current_user.id, MovieRating.tmdb_id == payload.tmdb_id).first()
    if existing:
        existing.rating = payload.rating
        existing.movie_title = payload.movie_title or existing.movie_title
        existing.updated_at = __import__('datetime').datetime.utcnow()
        db.commit()
        return {"status": "updated", "rating": existing.rating}

    item = MovieRating(user_id=current_user.id, tmdb_id=payload.tmdb_id, movie_title=payload.movie_title, rating=payload.rating)
    db.add(item)
    db.commit()
    return {"status": "added", "rating": item.rating}


@router.get("/recommendations")
def user_recommendations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_prefs = json.loads(current_user.favorite_genres or "[]") + json.loads(current_user.favorite_languages or "[]")
    watched_ids = [item.tmdb_id for item in db.query(WatchlistItem).filter(WatchlistItem.user_id == current_user.id).all()]
    catalog = []
    for movie in TMDBService.get_trending(1)[:12]:
        catalog.append(movie)
    for movie in TMDBService.get_top_rated(1)[:12]:
        catalog.append(movie)
    results = recommend_for_user(catalog, user_prefs, top_n=8)
    filtered = [item for item in results if item.get("id") not in watched_ids]
    return {"results": filtered[:6]}


@router.get("/public-movies")
def public_movies():
    return {
        "trending": TMDBService.get_trending(1)[:6],
        "latest": TMDBService.get_latest(1)[:6],
        "top_rated": TMDBService.get_top_rated(1)[:6],
    }
