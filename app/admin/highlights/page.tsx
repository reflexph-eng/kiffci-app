'use client';
/**
 * /admin/highlights — Le SEUL et unique endroit pour piloter la mise en avant
 * (badges Nouveau/Tendance/Coup de cœur/Top 10/Sponsorisé), quel que soit le
 * type de contenu : Expérience, Établissement ou Événement.
 *
 * Construit pour résoudre un vrai trou : le bouton "Mise en avant" n'existait
 * jusque-là que sur /admin/partners, qui ne liste jamais les Expériences —
 * rendant impossible la mise en avant d'un contenu éditorial créé directement
 * depuis l'onglet Expériences de l'admin.
 */
import { useEffect, useMemo, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { getAllExperiencesAdmin } from '@/lib/firestore';
import { getAllEstablishmentsAdmin, getAllEventsAdmin } from '@/lib/partner-firestore';
import HighlightModal from '@/components/HighlightModal';
import { HIGHLIGHT_BADGES, HighlightPatch } from '@/lib/highlights';
import { Experience, Establishment, KiffEvent } from '@/types';
import { Compass, Store, Calendar, Search, Sparkles, Info } from 'lucide-react';

type Kind = 'experience' | 'establishment' | 'event';
type Row = {
  kind: Kind;
  id: string;
  name: string;
  city: string;
  status: string;
  highlight: HighlightPatch;
};

const KIND_LABELS: Record<Kind, string> = { experience: 'Expérience', establishment: 'Établissement', event: 'Événement' };
const KIND_ICONS: Record<Kind, typeof Compass> = { experience: Compass, establishment: Store, event: Calendar };
const KIND_COLORS: Record<Kind, string> = {
  experience: 'bg-solar/10 text-solar', establishment: 'bg-lagoon/10 text-lagoon', event: 'bg-tropical/10 text-tropical',
};

function toRow(kind: Kind, item: Experience | Establishment | KiffEvent): Row {
  const name = 'title' in item ? item.title : 'name' in item ? item.name : '';
  const status = kind === 'experience'
    ? ((item as Experience).isPublished ? 'publiée' : 'brouillon')
    : (item as Establishment | KiffEvent).status;
  return {
    kind, id: item.id, name, city: item.city, status,
    highlight: {
      highlightType: item.highlightType, highlightStatus: item.highlightStatus, highlightBadge: item.highlightBadge,
      highlightSections: item.highlightSections, highlightStartAt: item.highlightStartAt, highlightEndAt: item.highlightEndAt,
      highlightRank: item.highlightRank,
    },
  };
}

export default function AdminHighlightsPage() {
  const { appUser } = useAuth();
  const [rows, setRows]       = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ]             = useState('');
  const [kindFilter, setKindFilter] = useState<Kind | 'all'>('all');
  const [activeOnly, setActiveOnly] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);

  async function refresh() {
    setLoading(true);
    const [exps, ests, events] = await Promise.all([
      getAllExperiencesAdmin(), getAllEstablishmentsAdmin(), getAllEventsAdmin(),
    ]);
    setRows([
      ...exps.map(e => toRow('experience', e)),
      ...ests.filter(e => e.status === 'approved').map(e => toRow('establishment', e)),
      ...events.filter(e => e.status === 'approved').map(e => toRow('event', e)),
    ]);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => rows.filter(r => {
    const okKind = kindFilter === 'all' || r.kind === kindFilter;
    const okActive = !activeOnly || r.highlight.highlightStatus === 'active';
    const okText = `${r.name} ${r.city}`.toLowerCase().includes(q.toLowerCase());
    return okKind && okActive && okText;
  }), [rows, kindFilter, activeOnly, q]);

  function badgeLabel(badge?: string) {
    return HIGHLIGHT_BADGES.find(b => b.value === badge)?.label ?? 'Aucun';
  }

  return (
    <AuthGuard adminOnly>
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="font-display font-bold text-3xl text-anthracite flex items-center gap-2 mb-2">
          <Sparkles className="text-solar" aria-hidden /> Mise en avant
        </h1>
        <p className="text-gray-500 text-sm mb-4">
          Le seul endroit où activer un badge (Tendance, Coup de cœur, Top 10…) — sur une Expérience,
          un Établissement ou un Événement, sans distinction.
        </p>

        <div className="flex items-start gap-2.5 bg-lagoon/5 border border-lagoon/20 rounded-2xl px-4 py-3 mb-6 text-sm text-gray-600">
          <Info size={16} className="text-lagoon shrink-0 mt-0.5" aria-hidden />
          <p>
            <strong>Expérience</strong> = contenu éditorial que vous créez et publiez vous-même (onglet Expériences).{' '}
            <strong>Établissement</strong> = fiche d'un lieu partenaire, avec modération, code de passage, Premium/Sponsorisé/Vérifié
            (gérée séparément dans <span className="font-medium">Premium & Sponsorisé</span>).{' '}
            Les deux peuvent recevoir un badge de mise en avant ici.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher par nom ou ville…"
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-gray-200 focus:border-solar outline-none text-sm" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'experience', 'establishment', 'event'] as const).map(k => (
              <button key={k} onClick={() => setKindFilter(k)}
                className={`px-4 py-2.5 rounded-2xl text-sm font-medium transition ${
                  kindFilter === k ? 'bg-solar text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {k === 'all' ? 'Tout' : KIND_LABELS[k]}
              </button>
            ))}
            <button onClick={() => setActiveOnly(a => !a)}
              className={`px-4 py-2.5 rounded-2xl text-sm font-medium transition ${
                activeOnly ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              Actifs seulement
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Chargement…</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun résultat.</p>
        ) : (
          <div className="border border-gray-100 rounded-2xl divide-y divide-gray-100 bg-white overflow-hidden">
            {filtered.map(r => {
              const Icon = KIND_ICONS[r.kind];
              const isActive = r.highlight.highlightStatus === 'active';
              return (
                <div key={`${r.kind}-${r.id}`} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50/60 transition">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${KIND_COLORS[r.kind]}`}>
                    <Icon size={15} aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-anthracite truncate">{r.name}</p>
                    <p className="text-xs text-gray-400">{KIND_LABELS[r.kind]} · {r.city || '—'}</p>
                  </div>
                  <button onClick={() => setEditing(r)}
                    className={`shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition ${
                      isActive ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    <Sparkles size={12} aria-hidden />
                    {isActive ? badgeLabel(r.highlight.highlightBadge) : 'Mise en avant'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {editing && appUser && (
          <HighlightModal
            kind={editing.kind}
            targetId={editing.id}
            targetName={editing.name}
            initial={editing.highlight}
            actorId={appUser.uid}
            actorName={appUser.displayName || appUser.email}
            onClose={() => setEditing(null)}
            onSaved={(patch) => {
              setRows(prev => prev.map(r => (r.kind === editing.kind && r.id === editing.id) ? { ...r, highlight: patch } : r));
              setEditing(null);
            }}
          />
        )}
      </main>
    </AuthGuard>
  );
}
