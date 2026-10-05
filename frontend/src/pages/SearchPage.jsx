import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const runSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/movies/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data.results || []);
      setError('');
    } catch {
      setError('Search is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search movies, actors, directors..." className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white" />
        <button onClick={runSearch} className="rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white">Search</button>
      </div>
      {loading && <div className="rounded-2xl bg-slate-900 p-6 text-slate-300">Loading results...</div>}
      {error && <div className="rounded-2xl border border-red-500/30 bg-red-900/10 p-6 text-red-200">{error}</div>}
      {!loading && results.length === 0 && query && <div className="rounded-2xl bg-slate-900/60 p-6 text-slate-300">No results found.</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {results.map((item) => (
          <button key={`${item.media_type}-${item.id}`} onClick={() => item.media_type === 'movie' ? navigate(`/movie/${item.id}`) : null} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 text-left hover:border-violet-500">
            <div className="text-lg font-semibold text-white">{item.title}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{item.media_type}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SearchPage;
