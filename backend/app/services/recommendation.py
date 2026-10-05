from datetime import datetime, timedelta
import os
from typing import Any, Dict, List, Optional

import requests
from jose import jwt
from passlib.context import CryptContext

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(subject: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Dict[str, Any]:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])


class TMDBService:
    base_url = "https://api.themoviedb.org/3"

    @staticmethod
    def _headers():
        return {"Authorization": f"Bearer {settings.TMDB_API_KEY}", "Accept": "application/json"}

    @classmethod
    def request(cls, path: str, params: Optional[Dict[str, Any]] = None):
        if not settings.TMDB_API_KEY:
            raise ValueError("TMDB_API_KEY is not configured.")
        response = requests.get(f"{cls.base_url}{path}", headers=cls._headers(), params=params or {}, timeout=20)
        response.raise_for_status()
        return response.json()

    @classmethod
    def normalize_movie(cls, item: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "id": item.get("id"),
            "title": item.get("title") or item.get("name"),
            "original_title": item.get("original_title") or item.get("original_name"),
            "overview": item.get("overview") or "No synopsis available.",
            "poster_path": item.get("poster_path"),
            "backdrop_path": item.get("backdrop_path"),
            "release_date": item.get("release_date") or item.get("first_air_date"),
            "vote_average": item.get("vote_average"),
            "popularity": item.get("popularity"),
            "genre_ids": item.get("genre_ids", []),
            "original_language": item.get("original_language"),
            "media_type": item.get("media_type", "movie"),
        }

    @classmethod
    def get_trending(cls, page: int = 1):
        data = cls.request("/trending/movie/week", {"page": page})
        return [cls.normalize_movie(item) for item in data.get("results", [])]

    @classmethod
    def get_latest(cls, page: int = 1):
        data = cls.request("/movie/now_playing", {"page": page, "language": "en-US"})
        return [cls.normalize_movie(item) for item in data.get("results", [])]

    @classmethod
    def get_top_rated(cls, page: int = 1):
        data = cls.request("/movie/top_rated", {"page": page, "language": "en-US"})
        return [cls.normalize_movie(item) for item in data.get("results", [])]

    @classmethod
    def get_upcoming(cls, page: int = 1):
        data = cls.request("/movie/upcoming", {"page": page, "language": "en-US"})
        return [cls.normalize_movie(item) for item in data.get("results", [])]

    @classmethod
    def get_by_language(cls, language: str, page: int = 1):
        lang_map = {"telugu": "te", "hindi": "hi", "tamil": "ta", "kannada": "kn", "malayalam": "ml", "english": "en"}
        lang_code = lang_map.get(language.lower(), "en")
        data = cls.request("/discover/movie", {"with_original_language": lang_code, "page": page})
        return [cls.normalize_movie(item) for item in data.get("results", [])]

    @classmethod
    def get_by_genre(cls, genre_name: str, page: int = 1):
        genre_map = {"action": 28, "adventure": 12, "animation": 16, "comedy": 35, "crime": 80, "documentary": 99, "drama": 18, "family": 10751, "fantasy": 14, "horror": 27, "mystery": 9648, "romance": 10749, "science fiction": 878, "sci-fi": 878, "thriller": 53, "war": 10752, "western": 37}
        genre_id = genre_map.get(genre_name.lower())
        if genre_id is None:
            return []
        data = cls.request("/discover/movie", {"with_genres": genre_id, "page": page})
        return [cls.normalize_movie(item) for item in data.get("results", [])]

    @classmethod
    def search(cls, query: str, page: int = 1):
        data = cls.request("/search/multi", {"query": query, "page": page})
        results = []
        for item in data.get("results", []):
            if item.get("media_type") in {"movie", "person"}:
                results.append({
                    "id": item.get("id"),
                    "title": item.get("title") or item.get("name"),
                    "media_type": item.get("media_type"),
                    "poster_path": item.get("poster_path"),
                    "overview": item.get("overview") or "",
                    "vote_average": item.get("vote_average"),
                    "release_date": item.get("release_date") or item.get("first_air_date"),
                    "popularity": item.get("popularity"),
                    "known_for": item.get("known_for", []),
                })
        return results

    @classmethod
    def get_movie_details(cls, tmdb_id: int):
        movie = cls.request(f"/movie/{tmdb_id}", {"append_to_response": "videos,credits,keywords,similar,recommendations"})
        directors = [person for person in movie.get("credits", {}).get("crew", []) if person.get("job") == "Director"]
        cast = [
            {"name": member.get("name"), "character": member.get("character"), "profile_path": member.get("profile_path")}
            for member in movie.get("credits", {}).get("cast", [])[:6]
        ]
        keywords = [k.get("name") for k in movie.get("keywords", {}).get("keywords", [])[:10]]
        trailer = next((v for v in movie.get("videos", {}).get("results", []) if v.get("site") == "YouTube"), None)

        return {
            "id": movie.get("id"),
            "title": movie.get("title"),
            "original_title": movie.get("original_title"),
            "overview": movie.get("overview") or "No synopsis available.",
            "poster_path": movie.get("poster_path"),
            "backdrop_path": movie.get("backdrop_path"),
            "release_date": movie.get("release_date"),
            "vote_average": movie.get("vote_average"),
            "runtime": movie.get("runtime"),
            "original_language": movie.get("original_language"),
            "genres": movie.get("genres", []),
            "director": directors[0].get("name") if directors else None,
            "cast": cast,
            "keywords": keywords,
            "trailer": trailer,
            "similar": [cls.normalize_movie(item) for item in movie.get("similar", {}).get("results", [])[:8]],
            "recommendations": [cls.normalize_movie(item) for item in movie.get("recommendations", {}).get("results", [])[:8]],
        }
