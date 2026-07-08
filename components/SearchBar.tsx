'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';

/** Barre de recherche centrale de la homepage — redirige vers /experiences avec la requête. */
export default function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/experiences?q=${encodeURIComponent(q.trim())}` : '/experiences');
  }

  return (
    <form onSubmit={handleSubmit}
      className="relative w-full max-w-xl bg-white rounded-2xl shadow-soft border border-gray-100 flex items-center px-2 py-1.5">
      <Search size={18} className="text-gray-400 ml-3 shrink-0" aria-hidden />
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Un restaurant, une plage, une ville…"
        aria-label="Rechercher sur KiffCI"
        className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent placeholder:text-gray-400"
      />
      <button type="submit"
        className="bg-solar text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-orange-600 transition shrink-0">
        Rechercher
      </button>
    </form>
  );
}
