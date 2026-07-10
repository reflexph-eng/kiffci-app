'use client';
/** /establishments — liste publique des établissements approuvés (Sprint 1). */
import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import EstablishmentCard from '@/components/EstablishmentCard';
import { getApprovedEstablishments } from '@/lib/partner-firestore';
import { filterEarlyAccess } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Establishment } from '@/types';
import { Search } from 'lucide-react';
import SortSelect from '@/components/SortSelect';
import { usePagedList } from '@/hooks/usePagedList';

export default function EstablishmentsPage() {
  const { appUser } = useAuth();
  const [items, setItems]     = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ]             = useState('');
  const [cat, setCat]         = useState('Toutes');
  const [city, setCity]       = useState('Toutes');
  const [sort, setSort]       = useState('recent');

  useEffect(() => {
    getApprovedEstablishments().then(setItems).finally(() => setLoading(false));
  }, []);

  const visibleItems = useMemo(() => filterEarlyAccess(items, appUser?.points), [items, appUser?.points]);

  const categories = useMemo(
    () => ['Toutes', ...Array.from(new Set(visibleItems.map(i => i.category))).sort()],
    [visibleItems]);

  const cities = useMemo(
    () => ['Toutes', ...Array.from(new Set(visibleItems.map(i => i.city).filter(Boolean))).sort()],
    [visibleItems]);

  const filtered = useMemo(() => {
    const list = visibleItems.filter(i => {
      const okCat = cat === 'Toutes' || i.category === cat;
      const okCity = city === 'Toutes' || i.city === city;
      const text  = `${i.name} ${i.description} ${i.city} ${i.district}`.toLowerCase();
      return okCat && okCity && text.includes(q.toLowerCase());
    });
    const sorted = [...list];
    if (sort === 'popular') sorted.sort((a, b) => b.views - a.views);
    if (sort === 'alpha')   sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [visibleItems, q, cat, city, sort]);

  const { visible, hasMore, remaining, loadMore } = usePagedList(filtered, 12);

  return (
    <main>
      <PageHeader
        title="Établissements"
        subtitle="Restaurants, espaces détente, lieux de sortie : découvre les établissements partenaires de Kiffci."
        crumbs={[{ label: 'Établissements' }]} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtres */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Rechercher un établissement, un quartier…"
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-solar focus:ring-2 focus:ring-solar/20 outline-none text-sm" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-4 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition ${
                  cat === c ? 'bg-solar text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative">
            <select value={city} onChange={e => setCity(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 rounded-2xl border border-gray-200 focus:border-solar outline-none text-sm bg-white">
              {cities.map(c => <option key={c} value={c}>{c === 'Toutes' ? 'Toutes les villes' : c}</option>)}
            </select>
          </div>
          <SortSelect value={sort} onChange={setSort} options={[
            { value: 'recent',  label: 'Plus récents' },
            { value: 'popular', label: 'Plus populaires' },
            { value: 'alpha',   label: 'Alphabétique' },
          ]} />
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-4xl shadow-card overflow-hidden">
                <div className="h-44 bg-gray-100 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-gray-100 rounded-full w-1/3 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded-full w-2/3 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded-full w-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🏝️</p>
            <h2 className="font-display font-bold text-xl text-anthracite mb-2">
              {items.length === 0 ? 'Les premiers établissements arrivent bientôt' : 'Aucun résultat'}
            </h2>
            <p className="text-gray-500">
              {items.length === 0
                ? 'Nos partenaires sont en cours de sélection. Reviens très vite !'
                : 'Essaie avec d’autres mots-clés ou une autre catégorie.'}
            </p>
          </div>
        ) : (
          <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map(e => <EstablishmentCard key={e.id} e={e} />)}
          </div>
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button onClick={loadMore}
                className="bg-white border border-gray-200 text-anthracite font-medium px-6 py-3 rounded-2xl hover:bg-gray-50 transition text-sm">
                Voir {Math.min(remaining, 12)} de plus
              </button>
            </div>
          )}
          </>
        )}
      </div>
    </main>
  );
}
