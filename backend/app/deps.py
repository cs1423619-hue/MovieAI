import math
import re
from collections import Counter
from typing import Any, Dict, List, Sequence


def normalize_text(value: str) -> str:
    if not value:
        return ""
    value = value.lower()
    value = re.sub(r"[^a-z0-9\s]", " ", value)
    return " ".join(value.split())


def build_movie_text(movie: Dict[str, Any]) -> str:
    genres = " ".join((g.get("name") if isinstance(g, dict) else str(g)) for g in movie.get("genres", []) or [])
    keywords = " ".join(movie.get("keywords", []) or [])
    cast = " ".join((member.get("name") if isinstance(member, dict) else str(member)) for member in movie.get("cast", []) or [])
    director = movie.get("director") or ""
    language = movie.get("original_language") or ""
    overview = movie.get("overview") or ""
    title = movie.get("title") or ""
    return " ".join([title, genres, overview, keywords, cast, director, language])


def cosine_similarity(vec_a: Dict[str, float], vec_b: Dict[str, float]) -> float:
    if not vec_a or not vec_b:
        return 0.0
    common = set(vec_a) | set(vec_b)
    dot = sum(vec_a.get(term, 0) * vec_b.get(term, 0) for term in common)
    mag_a = math.sqrt(sum(v * v for v in vec_a.values()))
    mag_b = math.sqrt(sum(v * v for v in vec_b.values()))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)


def make_vector(text: str) -> Dict[str, float]:
    counts = Counter(normalize_text(text).split())
    total = sum(counts.values()) or 1
    return {term: count / total for term, count in counts.items()}


def recommend_by_similarity(target_movie: Dict[str, Any], candidates: Sequence[Dict[str, Any]], top_n: int = 8) -> List[Dict[str, Any]]:
    if not candidates:
        return []
    target_text = build_movie_text(target_movie)
    target_vec = make_vector(target_text)
    scored = []
    for movie in candidates:
        candidate_text = build_movie_text(movie)
        candidate_vec = make_vector(candidate_text)
        score = cosine_similarity(target_vec, candidate_vec) * 100
        scored.append({**movie, "recommendation_score": round(score, 1)})
    scored.sort(key=lambda item: item.get("recommendation_score", 0), reverse=True)
    return scored[:top_n]


def recommend_for_user(movie_catalog: Sequence[Dict[str, Any]], user_preferences: Sequence[str], top_n: int = 8) -> List[Dict[str, Any]]:
    prefs = [normalize_text(item) for item in (user_preferences or [])]
    scored = []
    for movie in movie_catalog:
        text = normalize_text(build_movie_text(movie))
        score = 0.0
        for pref in prefs:
            if pref and pref in text:
                score += 25
        if movie.get("vote_average"):
            score += float(movie.get("vote_average", 0)) * 4
        if movie.get("original_language") and any(pref.lower() == str(movie.get("original_language")).lower() for pref in user_preferences or []):
            score += 20
        scored.append({**movie, "recommendation_score": round(score, 1)})
    scored.sort(key=lambda item: item.get("recommendation_score", 0), reverse=True)
    return scored[:top_n]
