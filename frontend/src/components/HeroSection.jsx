import { Link } from 'react-router-dom';

function HeroSection({ movie, onDetails }) {
  if (!movie) return null;

  const backdrop = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80';

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900">
      <img src={backdrop} alt={movie.title} className="h-[520px] w-full object-cover opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-900/20" />
      <div className="absolute inset-0 flex items-end p-6 md:p-10">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-amber-300">Featured</div>
          <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">{movie.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-200">
            <span>⭐ {movie.vote_average?.toFixed(1) || 'N/A'}</span>
            <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
            <span>{movie.original_language?.toUpperCase() || 'EN'}</span>
          </div>
          <p className="mt-5 max-w-xl text-base text-slate-200 md:text-lg">{movie.overview}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button onClick={() => onDetails(movie.id)} className="rounded-full bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-slate-200">More Details</button>
            <button className="rounded-full border border-white/20 bg-white/5 px-5 py-3 font-semibold text-white hover:bg-white/10">Watch Trailer</button>
            <button className="rounded-full bg-amber-400 px-5 py-3 font-semibold text-slate-950 hover:bg-amber-300">Add to Watchlist</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
