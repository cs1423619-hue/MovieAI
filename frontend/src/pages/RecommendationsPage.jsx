import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [langs, setLangs] = useState(['Telugu', 'Hindi']);
  const [genres, setGenres] = useState(['Action', 'Drama']);

  useEffect(() => {
    const token = localStorage.getItem('movieai-token');
    if (!token) {
      navigate('/auth');
      return;
    }

    fetch(`${API_BASE}/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setLangs(data.favorite_languages || ['Telugu']);
        setGenres(data.favorite_genres || ['Action']);
      })
      .catch(() => navigate('/auth'));
  }, [navigate]);

  const savePreferences = async () => {
    const token = localStorage.getItem('movieai-token');
    await fetch(`${API_BASE}/profile/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ favorite_languages: langs, favorite_genres: genres }),
    });
  };

  if (!profile) return <div className="rounded-2xl bg-slate-900 p-6 text-slate-300">Loading profile...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">👤 Profile</h1>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex flex-col gap-2">
          <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Name</div>
          <div className="text-2xl font-bold text-white">{profile.name}</div>
        </div>
        <div className="mt-4 text-sm text-slate-300">{profile.email}</div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="text-xl font-bold text-white">Favorite languages</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam', 'English'].map((lang) => (
              <button key={lang} onClick={() => setLangs((prev) => prev.includes(lang) ? prev.filter((item) => item !== lang) : [...prev, lang])} className={`rounded-full border px-3 py-2 text-sm ${langs.includes(lang) ? 'border-violet-500 bg-violet-500/10 text-violet-200' : 'border-slate-700 bg-slate-800 text-slate-300'}`}>
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="text-xl font-bold text-white">Favorite genres</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Action', 'Comedy', 'Drama', 'Thriller', 'Horror', 'Romance', 'Sci-Fi', 'Fantasy'].map((genre) => (
              <button key={genre} onClick={() => setGenres((prev) => prev.includes(genre) ? prev.filter((item) => item !== genre) : [...prev, genre])} className={`rounded-full border px-3 py-2 text-sm ${genres.includes(genre) ? 'border-amber-500 bg-amber-500/10 text-amber-200' : 'border-slate-700 bg-slate-800 text-slate-300'}`}>
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={savePreferences} className="rounded-xl bg-violet-600 px-5 py-3 font-bold text-white">Save preferences</button>
    </div>
  );
}

export default ProfilePage;
