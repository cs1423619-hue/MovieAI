import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MovieGrid from '../components/MovieGrid';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

function LanguagePage() {
  const { language } = useParams();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/movies/language/${language}`);
        const data = await response.json();
        setMovies(data.results || []);
        setError('');
      } catch (err) {
        setError('Unable to load movies for this language.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [language]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">{language ? `${language.charAt(0).toUpperCase() + language.slice(1)} Movies` : 'Movies'}</h1>
        <button onClick={() => navigate('/languages')} className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200">← Back</button>
      </div>
      <MovieGrid movies={movies} onDetails={(id) => navigate(`/movie/${id}`)} loading={loading} error={error} />
    </div>
  );
}

export default LanguagePage;
