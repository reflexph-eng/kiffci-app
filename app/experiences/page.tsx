'use client';
import { useMemo, useState, useEffect, Suspense, Fragment } from 'react';
import { useSearchParams } from 'next/navigation';
import ExperienceCard from '@/components/ExperienceCard';
import AdSlot from '@/components/AdSlot';
import Filters from '@/components/Filters';
import SortSelect from '@/components/SortSelect';
import { usePagedList } from '@/hooks/usePagedList';
import { getExperiences } from '@/lib/firestore';
import { Experience } from '@/types';

function ExperiencesContent() {
  const searchParams = useSearchParams();
  const [allExps,   setAllExps]   = useState<Experience[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [query,     setQuery]     = useState('');
  const [category,  setCategory]  = useState('');
  const [maxBudget, setMaxBudget] = useState(999999);
  const [mood,      setMood]      = useState('');
  const [sort,      setSort]      = useState('recent');

  useEffect(() => {
    setMood(searchParams.get('mood')?.toLowerCase() ?? '');
    setCategory(searchParams.get('category') ?? '');
  }, [searchParams]);

  useEffect(() => {
    getExperiences()
      .then(setAllExps)
      .catch(() => setError('Impossible de charger les expériences.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => {
      const list = allExps.filter((e) => {
        const q = (e.title + e.description + e.city + e.district + e.tags.join(' '))
          .toLowerCase().includes(query.toLowerCase());
        const c = !category || e.category === category;
        const b = maxBudget === 0 ? e.isFree : e.priceMin <= maxBudget;
        const m = !mood || e.mood.some((em) => em.toLowerCase().includes(mood));
        return q && c && b && m;
      });
      const sorted = [...list];
      if (sort === 'price_asc')  sorted.sort((a, b) => a.priceMin - b.priceMin);
      if (sort === 'price_desc') sorted.sort((a, b) => b.priceMin - a.priceMin);
      if (sort === 'alpha')      sorted.sort((a, b) => a.title.localeCompare(b.title));
      return sorted;
    },
    [allExps, query, category, maxBudget, mood, sort]
  );

  const { visible, hasMore, remaining, loadMore } = usePagedList(filtered, 12);

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl text-anthracite">Toutes les expériences</h1>
        <p className="text-gray-500 mt-2">Filtre par envie, budget ou catégorie.</p>
      </div>

      <Filters
        query={query} setQuery={setQuery}
        category={category} setCategory={setCategory}
        maxBudget={maxBudget} setMaxBudget={setMaxBudget}
        mood={mood} setMood={setMood}
        categories={Array.from(new Set(allExps.map((e) => e.category))).sort()}
      />

      {loading ? (
        <div className="mt-16 flex justify-center">
          <div className="w-10 h-10 border-4 border-solar border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="mt-16 text-center py-16 bg-red-50 rounded-4xl">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      ) : (
        <>
          <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
            <div className="text-sm text-gray-500">
              <span className="font-semibold text-anthracite">{filtered.length}</span> expérience{filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}
            </div>
            <SortSelect value={sort} onChange={setSort} options={[
              { value: 'recent',     label: 'Plus récentes' },
              { value: 'price_asc',  label: 'Prix croissant' },
              { value: 'price_desc', label: 'Prix décroissant' },
              { value: 'alpha',      label: 'Alphabétique' },
            ]} />
          </div>
          {filtered.length > 0 ? (
            <>
            <div className="mt-6 grid md:grid-cols-3 gap-6">
              {visible.map((e, i) => (
                <Fragment key={e.id}>
                  <ExperienceCard e={e} />
                  {(i + 1) % 6 === 0 && <AdSlot slotId="liste-experiences" variant="card" />}
                </Fragment>
              ))}
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
          ) : (
            <div className="mt-16 text-center py-16 bg-white rounded-4xl shadow-card">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="font-display font-bold text-xl">Aucun résultat</h3>
              <p className="text-gray-500 mt-2">Essaie de modifier tes filtres.</p>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default function ExperiencesPage() {
  return (
    <Suspense fallback={<main className="max-w-7xl mx-auto px-4 py-10 text-gray-400">Chargement…</main>}>
      <ExperiencesContent />
    </Suspense>
  );
}
