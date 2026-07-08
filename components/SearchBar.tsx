'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MapPin, Search, SlidersHorizontal } from 'lucide-react';

/** Barre de recherche premium de la homepage — redirige vers /experiences avec la requête. */
export default function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/experiences?q=${encodeURIComponent(q.trim())}` : '/experiences');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto bg-white/95 backdrop-blur rounded-[1.35rem] sm:rounded-[1.85rem] shadow-[0_18px_50px_rgba(15,23,42,0.13)] border border-white/80 p-2.5 flex flex-col sm:flex-row sm:items-center gap-2 transition-all duration-300 hover:shadow-card"
    >
      <div className="flex items-center flex-1 min-w-0 px-2 sm:px-3">
        <div className="w-10 h-10 rounded-2xl bg-solar/10 flex items-center justify-center shrink-0">
          <Search size={18} className="text-solar" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 px-3">
          <label htmlFor="home-search" className="block text-[11px] font-bold uppercase tracking-wide text-gray-400">
            Que veux-tu découvrir ?
          </label>
          <input
            id="home-search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Restaurant, plage, hôtel, ville…"
            aria-label="Rechercher sur KiffCI"
            className="w-full py-1 text-sm sm:text-base outline-none bg-transparent placeholder:text-gray-400 text-anthracite"
          />
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 px-3 py-2 border-l border-gray-100 text-gray-500 text-sm">
        <MapPin size={16} aria-hidden />
        <span>Abidjan</span>
      </div>

      <button
        type="button"
        aria-label="Filtres"
        className="hidden sm:flex w-11 h-11 items-center justify-center rounded-2xl border border-gray-100 text-gray-500 hover:text-solar hover:border-solar/30 transition"
      >
        <SlidersHorizontal size={17} />
      </button>

      <button
        type="submit"
        className="bg-anthracite text-white text-sm font-bold px-5 py-3 rounded-2xl hover:bg-solar hover:scale-[1.01] active:scale-[0.99] transition-all shrink-0"
      >
        Rechercher
      </button>
    </form>
  );
}
