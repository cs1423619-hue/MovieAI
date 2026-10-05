from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenPayload(BaseModel):
    sub: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProfilePreferences(BaseModel):
    favorite_languages: List[str] = []
    favorite_genres: List[str] = []


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    favorite_languages: List[str] = []
    favorite_genres: List[str] = []
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class RatingCreate(BaseModel):
    rating: float = Field(..., ge=1, le=10)


class WatchlistItemOut(BaseModel):
    id: int
    user_id: int
    tmdb_id: int
    title: Optional[str]
    poster_path: Optional[str]
    added_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class MovieRatingOut(BaseModel):
    id: int
    user_id: int
    tmdb_id: int
    movie_title: Optional[str]
    rating: float
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True
