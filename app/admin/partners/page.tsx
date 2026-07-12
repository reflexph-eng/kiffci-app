'use client';
/** /admin/partners — gestion des abonnements Premium/Sponsorisé (Sprint 3). */
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { getAllEstablishmentsAdmin, getAllEventsAdmin } from '@/lib/partner-firestore';
import { setPremiumStatus, setSponsoredStatus, setEarlyAccess } from '@/lib/subscriptions-firestore';
import { setVerifiedStatus } from '@/lib/verification-firestore';
import { Establishment, KiffEvent, HighlightBadge, HighlightStatus, HighlightSection } from '@/types';
import { Store, Calendar, Star, Sparkles, Search, BadgeCheck, Zap } from 'lucide-react';

type Row = {
  kind: 'establishment' | 'event';
  id: string;
  name: string;
  city: string;
  isFeatured: boolean;
  isSponsored: boolean;
  isVerified: boolean;
  premiumUntil?: number;
  earlyAccessUntil?: number;
  highlightBadge?: HighlightBadge;
  highlightStatus?: HighlightStatus;
  highlightSections?: HighlightSection[];
  highlightRank?: number;
};

function toRows(ests: Establishment[], events: KiffEvent[]): Row[] {
  return [
    ...ests.filter(e => e.status === 'approved').map(e => ({
      kind: 'establishment' as const, id: e.id, name: e.name, city: e.city,
      isFeatured: e.isFeatured, isSponsored: e.isSponsored, isVerified: e.isVerified,
      premiumUntil: e.premiumUntil, earlyAccessUntil: e.earlyAccessUntil,
      highlightBadge: e.highlightBadge, highlightStatus: e.highlightStatus,
      highlightSections: e.highlightSections, highlightRank: e.highlightRank,
    })),
    ...events.filter(e => e.status === 'approved').map(e => ({
      kind: 'event' as const, id: e.id, name: e.title, city: e.city,
      isFeatured: e.isFeatured, isSponsored: e.isSponsored, isVerified: false,
      premiumUntil: e.premiumUntil, earlyAccessUntil: e.earlyAccessUntil,
      highlightBadge: e.highlightBadge, highlightStatus: e.highlightStatus,
      highlightSections: e.highlightSections, highlightRank: e.highlightRank,
    })),
  ];
}

function fmtDate(ts?: number) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('fr-FR');
}

export default function AdminPartnersPage() {
  const { appUser } = useAuth();
  const [rows, setRows]       = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ]             = useState('');
  const [busy, setBusy]       = useState<string | null>(null);
  const [dateFor, setDateFor] = useState<string | null>(null);
  const [dateValue, setDateValue] = useState('');

  async function refresh() {
    const [ests, events] = await Promise.all([getAllEstablishmentsAdmin(), getAllEventsAdmin()]);
    setRows(toRows(ests, events));
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => rows.filter(r =>
    `${r.name} ${r.city}`.toLowerCase().includes(q.toLowerCase())
  ), [rows, q]);

  async function togglePremium(r: Row) {
    if (!appUser) return;
    if (!r.isFeatured) {
      // Activation : demander une échéance
      setDateFor(r.id);
      setDateValue('');
      return;
    }
    setBusy(r.id);
    await setPremiumStatus(r.kind, r.id, r.name, false, undefined, appUser.uid, appUser.displayName || appUser.email);
    await refresh();
    setBusy(null);
  }

  async function confirmPremiumActivation(r: Row) {
    if (!appUser) return;
    setBusy(r.id);
    const until = dateValue ? new Date(dateValue).getTime() : undefined;
    await setPremiumStatus(r.kind, r.id, r.name, true, until, appUser.uid, appUser.displayName || appUser.email);
    setDateFor(null);
    await refresh();
    setBusy(null);
  }

  async function toggleSponsored(r: Row) {
    if (!appUser) return;
    setBusy(r.id);
    await setSponsoredStatus(r.kind, r.id, r.name, !r.isSponsored, appUser.uid, appUser.displayName || appUser.email);
    await refresh();
    setBusy(null);
  }

  async function toggleVerified(r: Row) {
    if (!appUser || r.kind !== 'establishment') return;
    setBusy(r.id);
    await setVerifiedStatus(r.id, r.name, !r.isVerified, appUser.uid, appUser.displayName || appUser.email);
    await refresh();
    setBusy(null);
  }

  const isEarlyAccessActive = (r: Row) => !!r.earlyAccessUntil && r.earlyAccessUntil > Date.now();

  async function toggleEarlyAccess(r: Row) {
    if (!appUser) return;
    setBusy(r.id);
    await setEarlyAccess(r.kind, r.id, r.name, !isEarlyAccessActive(r), appUser.uid, appUser.displayName || appUser.email);
    await refresh();
    setBusy(null);
  }

  const isExpired = (r: Row) => !!r.premiumUntil && r.premiumUntil < Date.now();

  return (
    <AuthGuard adminOnly>
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="font-display font-bold text-3xl text-anthracite flex items-center gap-2 mb-2">
          <Sparkles className="text-solar" aria-hidden /> Créateurs — Premium & Sponsorisé
        </h1>
        <p className="text-gray-500 text-sm mb-2">
          Activez l'abonnement payant des établissements et événements approuvés.
        </p>
        <p className="text-sm mb-8">
          Pour activer un badge (Tendance, Coup de cœur, Top 10…) — sur ces contenus ou sur une Expérience — rendez-vous sur{' '}
          <Link href="/admin/highlights" className="font-medium text-solar hover:underline">Mise en avant</Link>.
        </p>

        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher un établissement, un événement…"
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-gray-200 focus:border-solar outline-none text-sm" />
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Chargement…</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun créateur approuvé pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map(r => (
              <div key={`${r.kind}-${r.id}`} className="bg-white rounded-3xl shadow-card px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    {r.kind === 'establishment' ? <Store size={15} className="text-gray-500" aria-hidden /> : <Calendar size={15} className="text-gray-500" aria-hidden />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-anthracite truncate">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.city}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {r.isFeatured && (
                    <span className={`text-xs px-2.5 py-1 rounded-full ${isExpired(r) ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500'}`}>
                      {isExpired(r) ? 'Expiré' : r.premiumUntil ? `Jusqu'au ${fmtDate(r.premiumUntil)}` : 'Sans échéance'}
                    </span>
                  )}
                  <button onClick={() => togglePremium(r)} disabled={busy === r.id}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition disabled:opacity-50 ${
                      r.isFeatured ? 'bg-solar text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    <Star size={13} aria-hidden /> Premium
                  </button>
                  <button onClick={() => toggleSponsored(r)} disabled={busy === r.id}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition disabled:opacity-50 ${
                      r.isSponsored ? 'bg-anthracite text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    <Sparkles size={13} aria-hidden /> Sponsorisé
                  </button>
                  {r.kind === 'establishment' && (
                    <button onClick={() => toggleVerified(r)} disabled={busy === r.id}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition disabled:opacity-50 ${
                        r.isVerified ? 'bg-lagoon text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      <BadgeCheck size={13} aria-hidden /> Vérifié
                    </button>
                  )}
                  <button onClick={() => toggleEarlyAccess(r)} disabled={busy === r.id}
                    title="Réserve ce contenu 24h aux niveaux Aventurier et plus"
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition disabled:opacity-50 ${
                      isEarlyAccessActive(r) ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    <Zap size={13} aria-hidden /> Accès prioritaire
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modale échéance Premium */}
        {dateFor && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full">
              <h2 className="font-display font-bold text-lg mb-1">Activer Premium</h2>
              <p className="text-sm text-gray-500 mb-4">Choisissez une échéance (optionnel — laissez vide pour une durée indéterminée).</p>
              <input type="date" value={dateValue} onChange={e => setDateValue(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm mb-4" />
              <div className="flex gap-3">
                <button onClick={() => { const r = filtered.find(x => x.id === dateFor); if (r) confirmPremiumActivation(r); }}
                  className="bg-solar text-white font-medium px-5 py-2.5 rounded-2xl hover:bg-orange-600 transition text-sm">
                  Activer
                </button>
                <button onClick={() => setDateFor(null)}
                  className="bg-gray-100 text-gray-600 font-medium px-5 py-2.5 rounded-2xl hover:bg-gray-200 transition text-sm">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modale Mise en avant */}
      </main>
    </AuthGuard>
  );
}
