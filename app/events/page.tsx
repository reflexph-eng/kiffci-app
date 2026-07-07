'use client';
/** /events — liste publique des événements approuvés (Sprint 1). */
import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import EventCard from '@/components/EventCard';
import { getApprovedEvents } from '@/lib/partner-firestore';
import { KiffEvent } from '@/types';
import { Search } from 'lucide-react';

export default function EventsPage() {
  const [items, setItems]     = useState<KiffEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ]             = useState('');
  const [when, setWhen]       = useState<'upcoming' | 'past' | 'all'>('upcoming');

  useEffect(() => {
    getApprovedEvents().then(setItems).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const now = Date.now();
    return items
      .filter(i => {
        const end = new Date(i.endDate || i.startDate).getTime();
        if (when === 'upcoming' && end < now) return false;
        if (when === 'past' && end >= now)    return false;
        const text = `${i.title} ${i.description} ${i.city} ${i.location}`.toLowerCase();
        return text.includes(q.toLowerCase());
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [items, q, when]);

  return (
    <main>
      <PageHeader
        title="Événements"
        subtitle="Concerts, festivals, soirées, activités : l'agenda des bons moments à ne pas rater."
        crumbs={[{ label: 'Événements' }]} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Rechercher un événement, une ville…"
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-solar focus:ring-2 focus:ring-solar/20 outline-none text-sm" />
          </div>
          <div className="flex gap-2">
            {([['upcoming', 'À venir'], ['past', 'Passés'], ['all', 'Tous']] as const).map(([v, label]) => (
              <button key={v} onClick={() => setWhen(v)}
                className={`px-4 py-2.5 rounded-2xl text-sm font-medium transition ${
                  when === v ? 'bg-solar text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-4xl shadow-card overflow-hidden">
                <div className="h-44 bg-gray-100 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded-full w-2/3 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded-full w-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎉</p>
            <h2 className="font-display font-bold text-xl text-anthracite mb-2">
              {when === 'upcoming' ? 'Aucun événement à venir pour le moment' : 'Aucun résultat'}
            </h2>
            <p className="text-gray-500">Reviens bientôt, l&apos;agenda se remplit chaque semaine !</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(e => <EventCard key={e.id} e={e} />)}
          </div>
        )}
      </div>
    </main>
  );
}
