import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(8);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`${API_BASE}/movies/${id}`);
        const data = await response.json();
        setMovie(data);
      } catch (err) {
        setError('Could not load movie details.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const submitRating = async () => {
    const token = localStorage.getItem('movieai-token');
    if (!token) {
      navigate('/auth');
      return;
    }

    await fetch(`${API_BASE}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tmdb_id: Number(id), movie_title: movie?.title, rating }),
    });
  };

  const toggleWatchlist = async () => {
    const token = localStorage.getItem('movieai-token');
    if (!token) {
      navigate('/auth');
      return;
    }
    await fetch(`${API_BASE}/watchlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tmdb_id: Number(id), title: movie?.title, poster_path: movie?.poster_path }),
    });
  };

  if (loading) return <div className="rounded-2xl bg-slate-900 p-6 text-slate-300">Loading movie details...</div>;
  if (error) return <div className="rounded-2xl border border-red-500/30 bg-red-900/10 p-6 text-red-200">{error}</div>;
  if (!movie) return null;

  const trailer = movie.trailer || null;

  return (
    <div className="space-y-8">
      <button onClick={() => navigate(-1)} className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200">← Back</button>
      <section className="relative overflow-hidden rounded-3xl border border-slate-800">
        <img src={movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba...'} alt={movie.title} className="h-[420px] w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-900/30" />
        <div className="absolute inset-0 flex flex-col justify-end gap-6 p-6 md:p-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-violet-300">Movie detail</p>
            <h1 className="text-4xl font-black text-white md:text-6xl">{movie.title}</h1>
            <p className="mt-3 text-lg text-slate-200">{movie.original_title}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-200">
              <span>⭐ {movie.vote_average?.toFixed(1)}</span>
              <span>{movie.release_date}</span>
              <span>{movie.runtime} min</span>
              <span>{movie.original_language?.toUpperCase()}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(movie.genres || []).map((genre) => (
                <span key={genre.id} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">{genre.name}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {trailer && (
              <a href={`https://www.youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noreferrer" className="rounded-full bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-500">▶ Watch Trailer</a>
            )}
            <button onClick={toggleWatchlist} className="rounded-full bg-amber-400 px-5 py-3 font-semibold text-slate-950 hover:bg-amber-300">❤️ Add to Watchlist</button>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-2xl font-bold text-white">Overview</h2>
          <p className="mt-4 text-slate-300">{movie.overview}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Director</p>
              <p className="mt-2 font-semibold text-white">{movie.director || 'Not available'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Language</p>
              <p className="mt-2 font-semibold text-white">{movie.original_language?.toUpperCase() || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Keywords</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(movie.keywords || []).slice(0, 8).map((keyword) => (
                  <span key={keyword} className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">{keyword}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Cast</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(movie.cast || []).slice(0, 5).map((person) => (
                  <span key={person.name} className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">{person.name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h3 className="text-xl font-bold text-white">Rate movie</h3>
          <div className="mt-4 flex items-center gap-3">
            <input type="range" min="1" max="10" value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-full accent-amber-400" />
            <span className="min-w-10 text-right text-xl font-bold text-amber-300">{rating}</span>
          </div>
          <button onClick={submitRating} className="mt-6 w-full rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950">⭐ Rate Movie</button>
          <button className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 font-bold text-white">🤖 Get Recommendations</button>
        </aside>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <h2 className="text-2xl font-bold text-white">🎯 Similar Movies</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {(movie.similar || []).map((item) => (
            <button key={item.id} onClick={() => navigate(`/movie/${item.id}`)} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-left hover:border-violet-500">
              <img src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://placehold.co/500x750/111827/94a3b8?text=Movie'} alt={item.title} className="h-56 w-full object-cover" />
              <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-white">{item.title}</h4>
                  <span className="text-xs text-amber-300">⭐ {item.vote_average?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MovieDetailPage;
