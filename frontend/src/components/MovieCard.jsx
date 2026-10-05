import { Link } from 'react-router-dom';

function formatYear(date) {
  return date ? new Date(date).getFullYear() : 'N/A';
}

function getPosterUrl(path) {
  return path ? `https://image.tmdb.org/t/p/w500${path}` : 'https://placehold.co/500x750/111827/94a3b8?text=Movie';
}

function MovieCard({ movie, onDetails }) {
  const genreList = movie.genre_ids || [];
  const displayGenres = genreList.slice(0, 2).map((g) => g.label || g).join(' • ');

  return (
    <article className="movie-card group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-violet-500/60">
      <div className="movie-poster relative">
        <img src={getPosterUrl(movie.poster_path)} alt={movie.title || 'Movie poster'} className="h-[360px] w-full object-cover transition duration-300 group-hover:scale-105" />
        <div className="overlay absolute inset-0 flex items-end bg-gradient-to-t from-slate-950 via-slate-900/35 to-transparent p-4 opacity-0 transition duration-300">
          <div className="w-full">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-200">
              <span className="rounded-full bg-slate-950/80 px-2 py-1">⭐ {movie.vote_average?.toFixed(1) || 'NR'}</span>
              <span className="rounded-full bg-slate-950/80 px-2 py-1">{formatYear(movie.release_date)}</span>
            </div>
            <button onClick={() => onDetails(movie.id)} className="w-full rounded-xl bg-white px-3 py-2 font-medium text-slate-950 hover:bg-amber-300">View details</button>
          </div>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-lg font-semibold text-white">{movie.title}</h3>
          <span className="rounded-full bg-amber-500/15 px-2 py-1 text-xs font-bold text-amber-300">{movie.vote_average?.toFixed(1) || 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{formatYear(movie.release_date)}</span>
          <span>{movie.original_language?.toUpperCase() || 'EN'}</span>
        </div>
        <p className="text-sm text-slate-300">{displayGenres || 'Popular'}</p>
        <div className="flex items-center justify-between gap-2 pt-2">
          <button onClick={() => onDetails(movie.id)} className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium hover:border-slate-500">Details</button>
          <button className="rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500">+ Watchlist</button>
        </div>
      </div>
    </article>
  );
}

export default MovieCard;
