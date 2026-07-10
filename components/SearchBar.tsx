'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/experiences?q=${encodeURIComponent(q.trim())}` : '/experiences');
  }

  return (
    <form onSubmit={handleSubmit} className="search-premium flex w-full items-center gap-2 bg-white p-2 text-anthracite shadow-[0_18px_60px_rgba(0,0,0,.22)]">
      <Search size={20} className="ml-2 shrink-0 text-gray-400" aria-hidden />
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Une plage, un restaurant, une sortie, une ville…"
        aria-label="Rechercher sur KIFFCI"
        className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm outline-none placeholder:text-gray-400 md:text-base"
      />
      <button type="submit" className="min-h-11 shrink-0 bg-solar px-4 text-sm font-bold text-white transition hover:bg-orange-600 md:px-7">
        <span className="hidden sm:inline">Rechercher</span>
        <Search size={18} className="sm:hidden" />
      </button>
    </form>
  );
}
