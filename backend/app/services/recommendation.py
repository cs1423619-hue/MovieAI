import json
from typing import Any, Dict, List, Optional

import requests

from app.config import settings

TMDB_BASE_URL = "https://api.themoviedb.org/3"
HEADERS = {"Authorization": f"Bearer {settings.TMDB_API_KEY}", "Accept": "application/json"}


def _request(path: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    if not settings.TMDB_API_KEY:
        raise ValueError("TMDB_API_KEY is not configured.")

    response = requests.get(f"{TMDB_BASE_URL}{path}", headers=HEADERS, params=params or {}, timeout=20)
    response.raise_for_status()
    return response.json()


def _movie_summary(movie: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": movie.get("id"),
        "title": movie.get("title") or movie.get("name"),
        "original_title": movie.get("original_title") or movie.get("original_name"),
        "overview": movie.get("overview") or "No synopsis available.",
        "poster_path": movie.get("poster_path"),
        "backdrop_path": movie.get("backdrop_path"),
        "release_date": movie.get("release_date") or movie.get("first_air_date"),
        "vote_average": movie.get("vote_average"),
        "vote_count": movie.get("vote_count"),
        "popularity": movie.get("popularity"),
        "genre_ids": movie.get("genre_ids", []),
        "original_language": movie.get("original_language"),
        "media_type": movie.get("media_type"),
        "adult": movie.get("adult", False),
    }


def fetch_trending(page: int = 1) -> List[Dict[str, Any]]:
    data = _request("/trending/movie/week", {"page": page})
    return [_movie_summary(item) for item in data.get("results", [])]


def fetch_latest(page: int = 1) -> List[Dict[str, Any]]:
    data = _request("/movie/now_playing", {"page": page, "language": "en-US"})
    return [_movie_summary(item) for item in data.get("results", [])]


def fetch_top_rated(page: int = 1) -> List[Dict[str, Any]]:
    data = _request("/movie/top_rated", {"page": page, "language": "en-US"})
    return [_movie_summary(item) for item in data.get("results", [])]


def fetch_upcoming(page: int = 1) -> List[Dict[str, Any]]:
    data = _request("/movie/upcoming", {"page": page, "language": "en-US"})
    return [_movie_summary(item) for item in data.get("results", [])]


def fetch_by_language(language: str, page: int = 1) -> List[Dict[str, Any]]:
    language_map = {
        "telugu": "te",
        "hindi": "hi",
        "tamil": "ta",
        "kannada": "kn",
        "malayalam": "ml",
        "english": "en",
    }
    lang_code = language_map.get(language.lower(), "en")
    data = _request("/discover/movie", {"with_original_language": lang_code, "page": page, "language": lang_code})
    return [_movie_summary(item) for item in data.get("results", [])]


def fetch_by_genre(genre_name: str, page: int = 1) -> List[Dict[str, Any]]:
    genre_map = {
        "action": 28,
        "adventure": 12,
        "animation": 16,
        "comedy": 35,
        "crime": 80,
        "documentary": 99,
        "drama": 18,
        "family": 10751,
        "fantasy": 14,
        "horror": 27,
        "mystery": 9648,
        "romance": 10749,
        "science fiction": 878,
        "thriller": 53,
        "war": 10752,
        "western": 37,
        "sci-fi": 878,
    }
    genre_id = genre_map.get(genre_name.lower())
    if genre_id is None:
        return []
    data = _request("/discover/movie", {"with_genres": genre_id, "page": page, "language": "en-US"})
    return [_movie_summary(item) for item in data.get("results", [])]


def search_tmdb(query: str, page: int = 1) -> List[Dict[str, Any]]:
    data = _request("/search/multi", {"query": query, "page": page, "language": "en-US"})
    results = []
    for item in data.get("results", []):
        if item.get("media_type") in {"movie", "person"}:
            results.append({
                "id": item.get("id"),
                "title": item.get("title") or item.get("name"),
                "media_type": item.get("media_type"),
                "poster_path": item.get("poster_path"),
                "overview": item.get("overview") or "",
                "known_for": item.get("known_for", []),
                "vote_average": item.get("vote_average"),
                "release_date": item.get("release_date") or item.get("first_air_date"),
                "popularity": item.get("popularity"),
            })
    return results


def get_movie_details(tmdb_id: int) -> Dict[str, Any]:
    movie = _request(f"/movie/{tmdb_id}", {"append_to_response": "videos,credits,keywords,similar,recommendations"})
    director = None
    cast = []
    for person in movie.get("credits", {}).get("crew", []):
        if person.get("job") == "Director":
            director = person.get("name")
            break
    for member in movie.get("credits", {}).get("cast", [])[:6]:
        cast.append({"name": member.get("name"), "character": member.get("character"), "profile_path": member.get("profile_path")})

    keywords = [k.get("name") for k in movie.get("keywords", {}).get("keywords", [])[:10]]
    videos = [v for v in movie.get("videos", {}).get("results", []) if v.get("site") == "YouTube"]

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
        "status": movie.get("status"),
        "original_language": movie.get("original_language"),
        "genres": movie.get("genres", []),
        "spoken_languages": movie.get("spoken_languages", []),
        "director": director,
        "cast": cast,
        "keywords": keywords,
        "videos": videos,
        "similar": [_movie_summary(item) for item in movie.get("similar", {}).get("results", [])[:8]],
        "recommendations": [_movie_summary(item) for item in movie.get("recommendations", {}).get("results", [])[:8]],
    }


def get_person_details(person_id: int) -> Dict[str, Any]:
    person = _request(f"/person/{person_id}", {})
    return {
        "id": person.get("id"),
        "name": person.get("name"),
        "known_for_department": person.get("known_for_department"),
        "biography": person.get("biography"),
        "profile_path": person.get("profile_path"),
        "birthday": person.get("birthday"),
        "place_of_birth": person.get("place_of_birth"),
        "popularity": person.get("popularity"),
    }
