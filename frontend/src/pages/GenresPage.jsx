import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const genreList = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'];

function GenresPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">🎬 Genres</h1>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {genreList.map((genre) => (
          <button key={genre} onClick={() => navigate(`/genre/${genre.toLowerCase().replace(/\s+/g, '-')}`)} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-left hover:border-violet-500">
            <div className="text-xl font-bold text-white">{genre}</div>
            <div className="mt-2 text-sm text-slate-300">Discover {genre.toLowerCase()} movies</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default GenresPage;
