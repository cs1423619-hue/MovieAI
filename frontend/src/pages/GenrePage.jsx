import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MovieGrid from '../components/MovieGrid';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

function GenrePage() {
  const { genre } = useParams();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`${API_BASE}/movies/genre/${genre}`);
        const data = await response.json();
        setMovies(data.results || []);
      } catch {
        setError('Unable to load genre results.');
      } finally {
        setLoading(false);
      }
    }
    if (genre) load();
  }, [genre]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">{genre ? genre.replace('-', ' ') : 'Genre'} Movies</h1>
      <MovieGrid movies={movies} onDetails={(id) => navigate(`/movie/${id}`)} loading={loading} error={error} />
    </div>
  );
}

export default GenrePage;
