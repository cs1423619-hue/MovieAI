import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

function RecommendationsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('movieai-token');
    if (!token) {
      navigate('/auth');
      return;
    }

    fetch(`${API_BASE}/recommendations`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [navigate]);

  if (loading) return <div className="rounded-2xl bg-slate-900 p-6 text-slate-300">Loading recommendations...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">🤖 AI Recommendations</h1>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {results.map((movie) => (
          <button key={movie.id} onClick={() => navigate(`/movie/${movie.id}`)} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 text-left hover:border-violet-500">
            <img src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750/111827/94a3b8?text=Movie'} alt={movie.title} className="h-72 w-full object-cover" />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{movie.title}</h3>
                <span className="text-xs text-amber-300">{movie.recommendation_score}%</span>
              </div>
              <div className="mt-2 text-xs text-slate-400">Matches your preferences</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default RecommendationsPage;
