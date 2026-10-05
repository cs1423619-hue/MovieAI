import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import MovieGrid from '../components/MovieGrid';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

function HomePage() {
  const [featured, setFeatured] = useState(null);
  const [trending, setTrending] = useState([]);
  const [latest, setLatest] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [trendingRes, latestRes, topRes] = await Promise.all([
          fetch(`${API_BASE}/movies/trending`),
          fetch(`${API_BASE}/movies/latest`),
          fetch(`${API_BASE}/movies/top-rated`),
        ]);

        const [trendingData, latestData, topData] = await Promise.all([
          trendingRes.json(),
          latestRes.json(),
          topRes.json(),
        ]);

        const trendingList = trendingData.results || [];
        const latestList = latestData.results || [];
        const topList = topData.results || [];

        setTrending(trendingList);
        setLatest(latestList);
        setTopRated(topList);
        setFeatured(trendingList[0] || latestList[0] || topList[0]);
        setError('');
      } catch (err) {
        setError('Movie data is temporarily unavailable. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-12">
      {loading ? <div className="rounded-2xl bg-slate-900 p-6 text-slate-300">Loading movie feed...</div> : null}
      {error ? <div className="rounded-2xl border border-red-500/30 bg-red-900/10 p-6 text-red-200">{error}</div> : null}
      {!loading && featured ? <HeroSection movie={featured} onDetails={(id) => navigate(`/movie/${id}`)} /> : null}

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">🔥 Trending Now</h2>
          <button onClick={() => navigate('/trending')} className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200">View All →</button>
        </div>
        <MovieGrid movies={trending.slice(0, 10)} onDetails={(id) => navigate(`/movie/${id}`)} loading={loading} error={error} />
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">🆕 Latest Releases</h2>
          <button onClick={() => navigate('/new-releases')} className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200">View All →</button>
        </div>
        <MovieGrid movies={latest.slice(0, 10)} onDetails={(id) => navigate(`/movie/${id}`)} loading={loading} error={error} />
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">⭐ Top Rated Movies</h2>
          <button onClick={() => navigate('/top-rated')} className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200">View All →</button>
        </div>
        <MovieGrid movies={topRated.slice(0, 10)} onDetails={(id) => navigate(`/movie/${id}`)} loading={loading} error={error} />
      </section>
    </div>
  );
}

export default HomePage;
