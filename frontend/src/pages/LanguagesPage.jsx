import { Link } from 'react-router-dom';

const languages = ['Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam', 'English'];

function LanguagesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Languages</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {languages.map((lang) => (
          <Link key={lang} to={`/language/${lang.toLowerCase()}`} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-violet-500">
            <div className="text-xl font-bold text-white">🇮🇳 {lang}</div>
            <div className="mt-2 text-sm text-slate-300">Browse curated {lang} picks</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default LanguagesPage;
