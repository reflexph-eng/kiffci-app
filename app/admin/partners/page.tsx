'use client';
/** /admin/partners — gestion Premium/Sponsorisé + mises en avant éditoriales. */
import { useEffect, useMemo, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { getAllEstablishmentsAdmin, getAllEventsAdmin } from '@/lib/partner-firestore';
import { setPremiumStatus, setSponsoredStatus, setEarlyAccess, setHighlightSettings } from '@/lib/subscriptions-firestore';
import { setVerifiedStatus } from '@/lib/verification-firestore';
import { Establishment, HighlightBadge, HighlightSection, HighlightStatus, HighlightType, KiffEvent } from '@/types';
import { Store, Calendar, Star, Sparkles, Search, BadgeCheck, Zap, Save } from 'lucide-react';
import {
  HIGHLIGHT_BADGES, HIGHLIGHT_SECTIONS, HIGHLIGHT_STATUSES, HIGHLIGHT_TYPES,
  HighlightPatch, dateInputToTimestamp, timestampToDateInput,
} from '@/lib/highlights';

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
  highlightType?: HighlightType;
  highlightStatus?: HighlightStatus;
  highlightBadge?: HighlightBadge;
  highlightSections?: HighlightSection[];
  highlightStartAt?: number;
  highlightEndAt?: number;
  highlightRank?: number;
  highlightPaymentRef?: string;
  highlightAmount?: number;
  highlightCurrency?: 'XOF';
};

type Draft = {
  highlightType: HighlightType;
  highlightStatus: HighlightStatus;
  highlightBadge: HighlightBadge;
  highlightSections: HighlightSection[];
  highlightStartAt: string;
  highlightEndAt: string;
  highlightRank: string;
  highlightPaymentRef: string;
  highlightAmount: string;
};

function toRows(ests: Establishment[], events: KiffEvent[]): Row[] {
  return [
    ...ests.filter(e => e.status === 'approved').map(e => ({
      kind: 'establishment' as const, id: e.id, name: e.name, city: e.city,
      isFeatured: e.isFeatured, isSponsored: e.isSponsored, isVerified: e.isVerified,
      premiumUntil: e.premiumUntil, earlyAccessUntil: e.earlyAccessUntil,
      highlightType: e.highlightType, highlightStatus: e.highlightStatus, highlightBadge: e.highlightBadge,
      highlightSections: e.highlightSections, highlightStartAt: e.highlightStartAt, highlightEndAt: e.highlightEndAt,
      highlightRank: e.highlightRank, highlightPaymentRef: e.highlightPaymentRef, highlightAmount: e.highlightAmount,
      highlightCurrency: e.highlightCurrency,
    })),
    ...events.filter(e => e.status === 'approved').map(e => ({
      kind: 'event' as const, id: e.id, name: e.title, city: e.city,
      isFeatured: e.isFeatured, isSponsored: e.isSponsored, isVerified: false,
      premiumUntil: e.premiumUntil, earlyAccessUntil: e.earlyAccessUntil,
      highlightType: e.highlightType, highlightStatus: e.highlightStatus, highlightBadge: e.highlightBadge,
      highlightSections: e.highlightSections, highlightStartAt: e.highlightStartAt, highlightEndAt: e.highlightEndAt,
      highlightRank: e.highlightRank, highlightPaymentRef: e.highlightPaymentRef, highlightAmount: e.highlightAmount,
      highlightCurrency: e.highlightCurrency,
    })),
  ];
}

function fmtDate(ts?: number) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('fr-FR');
}

function toDraft(r: Row): Draft {
  return {
    highlightType: r.highlightType ?? 'editorial',
    highlightStatus: r.highlightStatus ?? 'inactive',
    highlightBadge: r.highlightBadge ?? 'none',
    highlightSections: r.highlightSections ?? [],
    highlightStartAt: timestampToDateInput(r.highlightStartAt),
    highlightEndAt: timestampToDateInput(r.highlightEndAt),
    highlightRank: typeof r.highlightRank === 'number' ? String(r.highlightRank) : '',
    highlightPaymentRef: r.highlightPaymentRef ?? '',
    highlightAmount: typeof r.highlightAmount === 'number' ? String(r.highlightAmount) : '',
  };
}

export default function AdminPartnersPage() {
  const { appUser } = useAuth();
  const [rows, setRows]       = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ]             = useState('');
  const [busy, setBusy]       = useState<string | null>(null);
  const [dateFor, setDateFor] = useState<string | null>(null);
  const [dateValue, setDateValue] = useState('');
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  async function refresh() {
    const [ests, events] = await Promise.all([getAllEstablishmentsAdmin(), getAllEventsAdmin()]);
    const nextRows = toRows(ests, events);
    setRows(nextRows);
    setDrafts(Object.fromEntries(nextRows.map(r => [`${r.kind}-${r.id}`, toDraft(r)])));
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => rows.filter(r =>
    `${r.name} ${r.city}`.toLowerCase().includes(q.toLowerCase())
  ), [rows, q]);

  function updateDraft(key: string, patch: Partial<Draft>) {
    setDrafts(p => ({ ...p, [key]: { ...p[key], ...patch } }));
  }

  function toggleSection(key: string, section: HighlightSection) {
    const current = drafts[key]?.highlightSections ?? [];
    updateDraft(key, {
      highlightSections: current.includes(section)
        ? current.filter(s => s !== section)
        : [...current, section],
    });
  }

  async function togglePremium(r: Row) {
    if (!appUser) return;
    if (!r.isFeatured) { setDateFor(r.id); setDateValue(''); return; }
    setBusy(r.id);
    await setPremiumStatus(r.kind, r.id, r.name, false, undefined, appUser.uid, appUser.displayName || appUser.email);
    await refresh(); setBusy(null);
  }

  async function confirmPremiumActivation(r: Row) {
    if (!appUser) return;
    setBusy(r.id);
    const until = dateValue ? new Date(dateValue).getTime() : undefined;
    await setPremiumStatus(r.kind, r.id, r.name, true, until, appUser.uid, appUser.displayName || appUser.email);
    setDateFor(null); await refresh(); setBusy(null);
  }

  async function toggleSponsored(r: Row) {
    if (!appUser) return;
    setBusy(r.id);
    await setSponsoredStatus(r.kind, r.id, r.name, !r.isSponsored, appUser.uid, appUser.displayName || appUser.email);
    await refresh(); setBusy(null);
  }

  async function toggleVerified(r: Row) {
    if (!appUser || r.kind !== 'establishment') return;
    setBusy(r.id);
    await setVerifiedStatus(r.id, r.name, !r.isVerified, appUser.uid, appUser.displayName || appUser.email);
    await refresh(); setBusy(null);
  }

  const isEarlyAccessActive = (r: Row) => !!r.earlyAccessUntil && r.earlyAccessUntil > Date.now();

  async function toggleEarlyAccess(r: Row) {
    if (!appUser) return;
    setBusy(r.id);
    await setEarlyAccess(r.kind, r.id, r.name, !isEarlyAccessActive(r), appUser.uid, appUser.displayName || appUser.email);
    await refresh(); setBusy(null);
  }

  async function saveHighlight(r: Row) {
    if (!appUser) return;
    const key = `${r.kind}-${r.id}`;
    const d = drafts[key] ?? toDraft(r);
    setBusy(key);
    const patch: HighlightPatch = {
      highlightType: d.highlightType,
      highlightStatus: d.highlightStatus,
      highlightBadge: d.highlightBadge,
      highlightSections: d.highlightSections,
      highlightStartAt: dateInputToTimestamp(d.highlightStartAt),
      highlightEndAt: dateInputToTimestamp(d.highlightEndAt),
      highlightRank: d.highlightRank ? Number(d.highlightRank) : null,
      highlightPaymentRef: d.highlightPaymentRef.trim() || null,
      highlightAmount: d.highlightAmount ? Number(d.highlightAmount) : null,
      highlightCurrency: 'XOF',
      isFeatured: d.highlightStatus === 'active' && d.highlightType === 'editorial',
      isSponsored: d.highlightStatus === 'active' && d.highlightType === 'sponsored',
      premiumUntil: dateInputToTimestamp(d.highlightEndAt),
    };
    await setHighlightSettings(r.kind, r.id, r.name, patch, appUser.uid, appUser.displayName || appUser.email);
    await refresh(); setBusy(null);
  }

  const isExpired = (r: Row) => !!r.premiumUntil && r.premiumUntil < Date.now();

  return (
    <AuthGuard adminOnly>
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="font-display font-bold text-3xl text-anthracite flex items-center gap-2 mb-2">
          <Sparkles className="text-solar" aria-hidden /> Partenaires — Premium & Mise en avant
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Gérez les badges, les rubriques homepage et la base technique du sponsoring Mobile Money futur.
        </p>

        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher un établissement, un événement…"
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-gray-200 focus:border-solar outline-none text-sm" />
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Chargement…</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun partenaire approuvé pour le moment.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map(r => {
              const key = `${r.kind}-${r.id}`;
              const d = drafts[key] ?? toDraft(r);
              return (
                <div key={key} className="bg-white rounded-3xl shadow-card px-6 py-5 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        {r.kind === 'establishment' ? <Store size={15} className="text-gray-500" aria-hidden /> : <Calendar size={15} className="text-gray-500" aria-hidden />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-bold text-anthracite truncate">{r.name}</p>
                        <p className="text-xs text-gray-400">{r.city} · {r.kind === 'establishment' ? 'Établissement' : 'Événement'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {r.isFeatured && (
                        <span className={`text-xs px-2.5 py-1 rounded-full ${isExpired(r) ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500'}`}>
                          {isExpired(r) ? 'Expiré' : r.premiumUntil ? `Jusqu'au ${fmtDate(r.premiumUntil)}` : 'Premium actif'}
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

                  <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                    <div className="grid md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">Type</label>
                        <select value={d.highlightType} onChange={e => updateDraft(key, { highlightType: e.target.value as HighlightType })}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-solar">
                          {HIGHLIGHT_TYPES.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">Statut</label>
                        <select value={d.highlightStatus} onChange={e => updateDraft(key, { highlightStatus: e.target.value as HighlightStatus })}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-solar">
                          {HIGHLIGHT_STATUSES.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">Badge visible</label>
                        <select value={d.highlightBadge} onChange={e => updateDraft(key, { highlightBadge: e.target.value as HighlightBadge })}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-solar">
                          {HIGHLIGHT_BADGES.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">Ordre</label>
                        <input type="number" value={d.highlightRank} onChange={e => updateDraft(key, { highlightRank: e.target.value })}
                          placeholder="1, 2, 3…" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-solar" />
                      </div>
                    </div>

                    <div className="mt-3 grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">Début</label>
                        <input type="date" value={d.highlightStartAt} onChange={e => updateDraft(key, { highlightStartAt: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-solar" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">Fin</label>
                        <input type="date" value={d.highlightEndAt} onChange={e => updateDraft(key, { highlightEndAt: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-solar" />
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-[11px] font-bold text-gray-500 mb-2">Rubriques homepage</p>
                      <div className="flex flex-wrap gap-2">
                        {HIGHLIGHT_SECTIONS.map(section => (
                          <button key={section.value} type="button" onClick={() => toggleSection(key, section.value)}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${d.highlightSections.includes(section.value) ? 'bg-anthracite text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-solar hover:text-solar'}`}>
                            {section.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 grid md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">Référence paiement futur</label>
                        <input value={d.highlightPaymentRef} onChange={e => updateDraft(key, { highlightPaymentRef: e.target.value })}
                          placeholder="Ex: MM-2026-001" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-solar" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">Montant XOF futur</label>
                        <input type="number" value={d.highlightAmount} onChange={e => updateDraft(key, { highlightAmount: e.target.value })}
                          placeholder="Ex: 10000" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-solar" />
                      </div>
                      <div className="flex items-end">
                        <button onClick={() => saveHighlight(r)} disabled={busy === key}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-solar text-white px-4 py-2 text-xs font-bold hover:bg-orange-600 transition disabled:opacity-60">
                          {busy === key ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={14} />}
                          Sauvegarder mise en avant
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {dateFor && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full">
              <h2 className="font-display font-bold text-lg mb-1">Activer Premium</h2>
              <p className="text-sm text-gray-500 mb-4">Choisissez une échéance (optionnel).</p>
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
      </main>
    </AuthGuard>
  );
}
