import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const endpoint = isLogin ? `${API_BASE}/auth/login` : `${API_BASE}/auth/register`;
    const payload = isLogin ? { email: form.email, password: form.password } : { name: form.name, email: form.email, password: form.password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.detail || 'Authentication failed');
        return;
      }
      localStorage.setItem('movieai-token', data.access_token);
      localStorage.setItem('movieai-user', JSON.stringify({ name: form.name || form.email.split('@')[0], email: form.email }));
      navigate('/profile');
    } catch {
      setError('Unable to authenticate right now.');
    }
  };

  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-soft">
      <h1 className="text-3xl font-black text-white">{isLogin ? 'Login' : 'Sign Up'}</h1>
      <div className="mt-6 flex gap-2 rounded-full bg-slate-800 p-1">
        <button className={`flex-1 rounded-full px-4 py-2 font-medium ${isLogin ? 'bg-white text-slate-950' : 'text-slate-200'}`} onClick={() => setIsLogin(true)}>Login</button>
        <button className={`flex-1 rounded-full px-4 py-2 font-medium ${!isLogin ? 'bg-white text-slate-950' : 'text-slate-200'}`} onClick={() => setIsLogin(false)}>Sign Up</button>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-4">
        {!isLogin && (
          <input value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Name" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" required />
        )}
        <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="Email" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" required />
        <input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} placeholder="Password" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" required />

        {error && <div className="rounded-xl border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-200">{error}</div>}

        <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-amber-400 px-4 py-3 font-bold text-white">{isLogin ? 'Login' : 'Create account'}</button>
      </form>
    </div>
  );
}

export default AuthPage;
