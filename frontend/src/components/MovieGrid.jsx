import { Link } from 'react-router-dom';

function MovieGrid({ movies, onDetails, loading, error, emptyMessage = 'No movies found.' }) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-2xl bg-slate-800/70 h-[360px]" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-900/10 p-6 text-red-200">
        <p className="font-semibold">Something went wrong.</p>
        <p className="mt-1 text-sm text-red-300">{error}</p>
        <button className="mt-4 rounded-lg bg-red-600 px-3 py-2 font-medium text-white">Retry</button>
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-8 text-center text-slate-300">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onDetails={onDetails} />
      ))}
    </div>
  );
}

export default MovieGrid;
