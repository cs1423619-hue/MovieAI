import math
import re
from collections import Counter
from typing import Dict, Iterable, List, Sequence, Tuple


def normalize_text(value: str) -> str:
    if not value:
        return ""
    value = value.lower()
    value = re.sub(r"[^a-z0-9\s]", " ", value)
    return " ".join(value.split())


def tfidf_vectorize(items: Iterable[str]) -> Tuple[Dict[str, float], Dict[str, int]]:
    doc_terms = []
    all_terms = set()
    for text in items:
        terms = normalize_text(text).split()
        doc_terms.append(terms)
        all_terms.update(terms)

    doc_freq = {term: 0 for term in all_terms}
    for terms in doc_terms:
        unique_terms = set(terms)
        for term in unique_terms:
            doc_freq[term] += 1

    idf = {}
    num_docs = max(len(doc_terms), 1)
    for term, freq in doc_freq.items():
        idf[term] = math.log((1 + num_docs) / (1 + freq)) + 1.0

    vectors = []
    for terms in doc_terms:
        counter = Counter(terms)
        vec = {}
        total_terms = len(terms)
        for term, count in counter.items():
            tf = count / total_terms if total_terms else 0
            vec[term] = tf * idf.get(term, 1.0)
        vectors.append(vec)
    return vectors, idf


def cosine_similarity(vec_a: Dict[str, float], vec_b: Dict[str, float]) -> float:
    if not vec_a or not vec_b:
        return 0.0
    dot = sum(vec_a.get(term, 0) * vec_b.get(term, 0) for term in set(vec_a) | set(vec_b))
    mag_a = math.sqrt(sum(value * value for value in vec_a.values()))
    mag_b = math.sqrt(sum(value * value for value in vec_b.values()))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)


def build_movie_text(movie: Dict[str, Any]) -> str:
    genres = " ".join((g.get("name") if isinstance(g, dict) else str(g)) for g in movie.get("genres", []) or [])
    keywords = " ".join(movie.get("keywords", []) or [])
    cast = " ".join((member.get("name") if isinstance(member, dict) else str(member)) for member in movie.get("cast", []) or [])
    director = movie.get("director") or ""
    language = movie.get("original_language") or ""
    overview = movie.get("overview") or ""
    title = movie.get("title") or ""
    return " ".join([title, genres, overview, keywords, cast, director, language])


def recommend_by_similarity(target_movie: Dict[str, Any], candidates: Sequence[Dict[str, Any]], top_n: int = 8) -> List[Dict[str, Any]]:
    if not candidates:
        return []
    target_text = build_movie_text(target_movie)
    target_vec = Counter(normalize_text(target_text).split())
    scored = []
    for candidate in candidates:
        candidate_text = build_movie_text(candidate)
        candidate_vec = Counter(normalize_text(candidate_text).split())
        score = 0.0
        for term in set(target_vec) | set(candidate_vec):
            score += target_vec.get(term, 0) * candidate_vec.get(term, 0)
        # A lightweight TF-IDF-like similarity approximation
        if not target_text or not candidate_text:
            continue
        score = cosine_similarity(dict(target_vec), dict(candidate_vec))
        scored.append({**candidate, "recommendation_score": round(score * 100, 1)})

    scored.sort(key=lambda x: x.get("recommendation_score", 0), reverse=True)
    return scored[:top_n]


def build_user_preferences_vector(user_preferences: Sequence[str]) -> Dict[str, int]:
    prefs = []
    for item in user_preferences or []:
        prefs.extend(normalize_text(str(item)).split())
    return dict(Counter(prefs))


def recommend_for_user(movie_catalog: Sequence[Dict[str, Any]], user_preferences: Sequence[str], ratings: Sequence[Dict[str, Any]], top_n: int = 8) -> List[Dict[str, Any]]:
    prefs = build_user_preferences_vector(user_preferences)
    scored = []
    for movie in movie_catalog:
        base_score = 0.0
        text = normalize_text(build_movie_text(movie))
        for term, weight in prefs.items():
            if term in text:
                base_score += weight
        if movie.get("vote_average"):
            base_score += float(movie["vote_average"]) / 10.0
        if movie.get("original_language"):
            for pref in user_preferences or []:
                if str(pref).lower() == str(movie.get("original_language")).lower():
                    base_score += 1.5
        scored.append({**movie, "recommendation_score": round(base_score * 100, 1)})

    scored.sort(key=lambda x: x.get("recommendation_score", 0), reverse=True)
    return scored[:top_n]
