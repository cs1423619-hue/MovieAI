import { useState } from 'react';
import { Link } from 'react-router-dom';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-900/70 p-4 md:flex-row md:items-center">
      <input
        aria-label="Search for movies or people"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search movies, actors, directors..."
        className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-400 focus:border-violet-500"
      />
      <button onClick={() => onSearch(query)} className="rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-500">Search</button>
    </div>
  );
}

export default SearchBar;
