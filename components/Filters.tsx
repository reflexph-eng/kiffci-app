'use client';
import { Search, X } from 'lucide-react';

const MOODS = ['Nature','Chill','Romantique','Fun','Culture','Nightlife','Food','Sport','Aventure'];

interface Props {
  query: string;     setQuery:     (v: string) => void;
  category: string;  setCategory:  (v: string) => void;
  maxBudget: number; setMaxBudget: (v: number) => void;
  mood: string;      setMood:      (v: string) => void;
  city?: string;      setCity?:     (v: string) => void;
  categories?: string[];
  cities?: string[];
}

export default function Filters({ query, setQuery, category, setCategory, maxBudget, setMaxBudget, mood, setMood, city = '', setCity, categories = [], cities = [] }: Props) {
  const hasFilters = query || category || maxBudget < 999999 || mood || city;

  return (
    <div className="bg-white rounded-4xl shadow-card p-5 space-y-4">
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar transition"
          placeholder="Rechercher une expérience, lieu, tag…"
          value={query} onChange={(e) => setQuery(e.target.value)}
        />
        {query && <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={16} /></button>}
      </div>
      <div className="flex flex-wrap gap-2">
        {MOODS.map((m) => (
          <button key={m} onClick={() => setMood(mood === m.toLowerCase() ? '' : m.toLowerCase())}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              mood === m.toLowerCase() ? 'bg-solar text-white border-solar' : 'bg-white text-gray-600 border-gray-200 hover:border-solar hover:text-solar'
            }`}>{m}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar bg-white">
          <option value="">Toutes catégories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {setCity && (
          <select value={city} onChange={(e) => setCity(e.target.value)}
            className="border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar bg-white">
            <option value="">Toutes les villes</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <select value={maxBudget} onChange={(e) => setMaxBudget(Number(e.target.value))}
          className="border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar bg-white">
          <option value={999999}>Tous budgets</option>
          <option value={0}>Gratuit uniquement</option>
          <option value={5000}>Moins de 5 000 FCFA</option>
          <option value={10000}>Moins de 10 000 FCFA</option>
          <option value={25000}>Moins de 25 000 FCFA</option>
          <option value={50000}>Moins de 50 000 FCFA</option>
        </select>
        {hasFilters && (
          <button onClick={() => { setQuery(''); setCategory(''); setMaxBudget(999999); setMood(''); setCity?.(''); }}
            className="flex items-center justify-center gap-2 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition">
            <X size={15} /> Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
