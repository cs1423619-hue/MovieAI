import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

function WatchlistPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('movieai-token');
    if (!token) {
      navigate('/auth');
      return;
    }

    fetch(`${API_BASE}/watchlist`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => res.json()).then((data) => {
      setMovies(data.results || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [navigate]);

  if (loading) return <div className="rounded-2xl bg-slate-900 p-6 text-slate-300">Loading watchlist...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">📚 My Watchlist</h1>
      {movies.length === 0 ? <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-8 text-center text-slate-300">No movies saved yet.</div> : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
          {movies.map((movie) => (
            <button key={movie.id} onClick={() => navigate(`/movie/${movie.tmdb_id}`)} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 text-left hover:border-violet-500">
              <img src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750/111827/94a3b8?text=Movie'} alt={movie.title || 'Watchlist movie'} className="h-72 w-full object-cover" />
              <div className="p-3 text-white">{movie.title}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default WatchlistPage;
