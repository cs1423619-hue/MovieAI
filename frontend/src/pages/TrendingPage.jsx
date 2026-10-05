import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieGrid from '../components/MovieGrid';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

function TrendingPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`${API_BASE}/movies/trending`);
        const data = await response.json();
        setMovies(data.results || []);
      } catch {
        setError('Unable to load trending movies.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">🔥 Trending Movies</h1>
      <MovieGrid movies={movies} onDetails={(id) => navigate(`/movie/${id}`)} loading={loading} error={error} />
    </div>
  );
}

export default TrendingPage;
