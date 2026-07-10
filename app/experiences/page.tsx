'use client';
import { useMemo, useState, useEffect, Suspense, Fragment } from 'react';
import { useSearchParams } from 'next/navigation';
import ExperienceCard from '@/components/ExperienceCard';
import AdSlot from '@/components/AdSlot';
import Filters from '@/components/Filters';
import SortSelect from '@/components/SortSelect';
import { usePagedList } from '@/hooks/usePagedList';
import { getExperiences } from '@/lib/firestore';
import { filterEarlyAccess } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Experience } from '@/types';
import { Compass, RotateCcw, Sparkles } from 'lucide-react';

function ExperiencesContent() {
  const searchParams = useSearchParams();
  const { appUser } = useAuth();
  const [allExps, setAllExps] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [maxBudget, setMaxBudget] = useState(999999);
  const [mood, setMood] = useState('');
  const [city, setCity] = useState('');
  const [sort, setSort] = useState('recent');

  useEffect(() => {
    setMood(searchParams.get('mood')?.toLowerCase() ?? '');
    setCategory(searchParams.get('category') ?? '');
    setQuery(searchParams.get('q') ?? '');
    setCity(searchParams.get('city') ?? '');
  }, [searchParams]);

  useEffect(() => {
    getExperiences().then(setAllExps).catch(() => setError('Impossible de charger les expériences.')).finally(() => setLoading(false));
  }, []);

  const visibleExps = useMemo(() => filterEarlyAccess(allExps, appUser?.points), [allExps, appUser?.points]);
  const filtered = useMemo(() => {
    const list = visibleExps.filter((e) => {
      const q = (e.title + e.description + e.city + e.district + e.tags.join(' ')).toLowerCase().includes(query.toLowerCase());
      return q && (!category || e.category === category) && (maxBudget === 0 ? e.isFree : e.priceMin <= maxBudget) && (!mood || e.mood.some((em) => em.toLowerCase().includes(mood))) && (!city || e.city === city);
    });
    const sorted = [...list];
    if (sort === 'price_asc') sorted.sort((a, b) => a.priceMin - b.priceMin);
    if (sort === 'price_desc') sorted.sort((a, b) => b.priceMin - a.priceMin);
    if (sort === 'alpha') sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [visibleExps, query, category, maxBudget, mood, city, sort]);

  const { visible, hasMore, remaining, loadMore } = usePagedList(filtered, 12);
  const resetFilters = () => { setQuery(''); setCategory(''); setMaxBudget(999999); setMood(''); setCity(''); };

  return (
    <main>
      <section className="border-b border-black/5 bg-sand/60">
        <div className="site-container py-12 md:py-16">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-solar"><Sparkles size={14} /> Choisis ton prochain souvenir</span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-anthracite md:text-6xl">Des expériences qui donnent envie de sortir.</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">Explore la Côte d’Ivoire par envie, par ambiance ou par budget. Chaque proposition est pensée comme une expérience à vivre, pas comme une simple adresse.</p>
          </div>
          <div className="mt-8"><Filters query={query} setQuery={setQuery} category={category} setCategory={setCategory} maxBudget={maxBudget} setMaxBudget={setMaxBudget} mood={mood} setMood={setMood} city={city} setCity={setCity} categories={Array.from(new Set(allExps.map(e => e.category))).sort()} cities={Array.from(new Set(allExps.map(e => e.city).filter(Boolean))).sort()} /></div>
        </div>
      </section>

      <section className="site-container py-10 md:py-14">
        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" aria-label="Chargement des expériences">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="space-y-4"><div className="skeleton aspect-[4/3]"/><div className="skeleton h-5 w-2/3 rounded"/><div className="skeleton h-4 w-full rounded"/></div>)}
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-red-100 bg-red-50 px-6 py-14 text-center"><p className="font-semibold text-red-600">{error}</p></div>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-200 pb-5">
              <div><p className="text-sm text-gray-500"><strong className="text-anthracite">{filtered.length}</strong> expérience{filtered.length !== 1 ? 's' : ''}</p><p className="mt-1 text-sm text-gray-400">Trouve celle qui correspond à ton moment.</p></div>
              <SortSelect value={sort} onChange={setSort} options={[{value:'recent',label:'Plus récentes'},{value:'price_asc',label:'Prix croissant'},{value:'price_desc',label:'Prix décroissant'},{value:'alpha',label:'Alphabétique'}]} />
            </div>

            {filtered.length > 0 ? (
              <>
                <div className="mt-8 grid gap-x-7 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
                  {visible.map((e, i) => <Fragment key={e.id}><ExperienceCard e={e} featured={i === 0} />{(i + 1) % 6 === 0 && <AdSlot slotId="liste-experiences" variant="card" />}</Fragment>)}
                </div>
                {hasMore && <div className="mt-12 flex justify-center"><button onClick={loadMore} className="rounded-full border border-gray-300 px-7 py-3 text-sm font-bold text-anthracite transition hover:border-solar hover:text-solar">Découvrir {Math.min(remaining, 12)} expériences de plus</button></div>}
              </>
            ) : (
              <div className="mt-10 flex min-h-[360px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-gray-300 bg-gray-50 px-6 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white text-solar shadow-soft"><Compass size={28}/></div>
                <h3 className="font-display text-2xl font-bold text-anthracite">Ton prochain kiff est sûrement juste à côté.</h3>
                <p className="mt-3 max-w-md text-gray-500">Aucune expérience ne correspond exactement à ces critères. Élargis ta recherche et laisse-toi surprendre.</p>
                <button onClick={resetFilters} className="mt-6 inline-flex items-center gap-2 rounded-full bg-anthracite px-6 py-3 text-sm font-bold text-white"><RotateCcw size={16}/> Réinitialiser les filtres</button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default function ExperiencesPage() {
  return <Suspense fallback={<main className="site-container py-16 text-gray-400">Chargement des expériences…</main>}><ExperiencesContent /></Suspense>;
}
