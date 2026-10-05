import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Trending', to: '/trending' },
  { label: 'New Releases', to: '/new-releases' },
  { label: 'Top Rated', to: '/top-rated' },
  { label: 'Languages', to: '/languages' },
  { label: 'Genres', to: '/genres' },
  { label: 'AI Recommendations', to: '/recommendations' },
  { label: 'Watchlist', to: '/watchlist' },
  { label: 'Search', to: '/search' },
  { label: 'Profile', to: '/profile' },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(() => localStorage.getItem('movieai-user') ? JSON.parse(localStorage.getItem('movieai-user')) : null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem('movieai-user');
    setUser(savedUser ? JSON.parse(savedUser) : null);
  }, [location]);

  const logout = () => {
    localStorage.removeItem('movieai-token');
    localStorage.removeItem('movieai-user');
    setUser(null);
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-xl font-bold tracking-tight text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-violet-600 font-black text-slate-950">M</span>
          MovieAI
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `rounded-full px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}` }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <span className="text-sm text-slate-300">Hi, {user.name}</span>
              <button onClick={logout} className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:border-slate-500">Logout</button>
            </>
          ) : (
            <Link to="/auth" className="rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-300">Login</Link>
          )}
        </div>

        <button className="rounded-lg border border-slate-700 p-2 lg:hidden" onClick={() => setMenuOpen((prev) => !prev)}>
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-800 bg-slate-950 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4">
            {navItems.map((item) => (
              <NavLink onClick={() => setMenuOpen(false)} key={item.to} to={item.to} className="rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800">
                {item.label}
              </NavLink>
            ))}
            {user ? (
              <button onClick={logout} className="rounded-lg bg-slate-800 px-3 py-2 text-left text-slate-200">Logout</button>
            ) : (
              <Link to="/auth" onClick={() => setMenuOpen(false)} className="rounded-lg bg-amber-400 px-3 py-2 text-left font-bold text-slate-950">Login</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
