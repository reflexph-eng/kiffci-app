'use client';
import { useEffect, useMemo, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import {
  getPendingEstablishments, getPendingEvents, getPendingExperiences,
  getAllEstablishmentsAdmin, getAllEventsAdmin, getAllExperiencesAdmin,
} from '@/lib/partner-firestore';
import { moderateWithReason, getModerationHistory } from '@/lib/moderation-firestore';
import { Establishment, Experience, KiffEvent, ModerationLog, Status } from '@/types';
import { Check, X, Store, Calendar, History, ChevronDown, ChevronUp, ShieldCheck, Sparkles } from 'lucide-react';

type Tab = 'pending' | 'all';
type Kind = 'establishment' | 'experience' | 'event';
type Section = 'establishments' | 'experiences' | 'events';
type ActionTarget = { kind: Kind; id: string; name: string; status: Status } | null;

function ModerationContent() {
  const { appUser } = useAuth();
  const [tab, setTab] = useState<Tab>('pending');
  const [section, setSection] = useState<Section>('experiences');
  const [ests, setEsts] = useState<Establishment[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [events, setEvents] = useState<KiffEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState('');
  const [actionTarget, setActionTarget] = useState<ActionTarget>(null);
  const [reason, setReason] = useState('');
  const [openHistory, setOpenHistory] = useState<string | null>(null);
  const [history, setHistory] = useState<ModerationLog[]>([]);

  function showToast(message: string) { setToast(message); setTimeout(() => setToast(''), 3000); }
  async function load() {
    setLoading(true); setLoadError('');
    try {
      const data = tab === 'pending'
        ? await Promise.all([getPendingEstablishments(), getPendingExperiences(), getPendingEvents()])
        : await Promise.all([getAllEstablishmentsAdmin(), getAllExperiencesAdmin(), getAllEventsAdmin()]);
      setEsts(data[0]); setExperiences(data[1]); setEvents(data[2]);
    } catch (error) {
      console.error(error); setLoadError("Impossible de charger la file de modération. Vérifie les droits du compte et les règles Firestore.");
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [tab]);

  const pendingCount = useMemo(() => [...ests, ...experiences, ...events].filter(x => x.status === 'pending').length, [ests, experiences, events]);

  async function confirmAction() {
    if (!actionTarget || !appUser) return;
    if (actionTarget.status === 'rejected' && !reason.trim()) { showToast('Le motif est obligatoire pour un rejet.'); return; }
    setBusy(actionTarget.id);
    try {
      await moderateWithReason(actionTarget.kind, actionTarget.id, actionTarget.name, actionTarget.status, reason.trim(), appUser.uid, appUser.displayName || appUser.email);
      showToast(actionTarget.status === 'approved' ? 'Publication approuvée' : 'Publication rejetée');
      setActionTarget(null); await load();
    } catch { showToast('Action impossible. Vérifie les droits du compte.'); }
    finally { setBusy(null); }
  }

  async function toggleHistory(kind: Kind, id: string) {
    if (openHistory === id) { setOpenHistory(null); return; }
    setOpenHistory(id); setHistory(await getModerationHistory(kind, id).catch(() => []));
  }

  function Actions({ kind, id, name, status, note }: { kind: Kind; id: string; name: string; status: Status; note?: string }) {
    return <>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => { setActionTarget({ kind, id, name, status: 'approved' }); setReason(''); }} disabled={busy === id} className="inline-flex items-center gap-2 rounded-xl bg-tropical px-4 py-2 text-sm font-bold text-white"><Check size={15}/>Approuver</button>
        <button onClick={() => { setActionTarget({ kind, id, name, status: 'rejected' }); setReason(''); }} disabled={busy === id} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white"><X size={15}/>Rejeter</button>
        <button onClick={() => toggleHistory(kind, id)} className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600"><History size={14}/>Historique {openHistory === id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}</button>
      </div>
      {note && status === 'rejected' && <p className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700"><strong>Motif :</strong> {note}</p>}
      {openHistory === id && <div className="mt-3 rounded-xl bg-gray-50 p-4 text-xs text-gray-600">{history.length ? history.map(h => <p key={h.id} className="border-b py-2 last:border-0"><strong>{h.action === 'approved' ? 'Approuvé' : 'Rejeté'}</strong> par {h.moderatorName} · {new Date(h.createdAt).toLocaleDateString('fr-FR')}{h.reason ? ` — ${h.reason}` : ''}</p>) : 'Aucun historique.'}</div>}
    </>;
  }

  const empty = <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center"><p className="text-4xl">✓</p><p className="mt-3 text-gray-500">Aucun contenu dans cette file.</p></div>;

  return <div>
    {toast && <div className="fixed right-4 top-20 z-50 rounded-2xl bg-anthracite px-5 py-3 font-semibold text-white shadow-soft">{toast}</div>}
    {actionTarget && <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4"><div className="w-full max-w-md rounded-3xl bg-white p-6"><h2 className="font-display text-xl font-bold">{actionTarget.status === 'approved' ? 'Approuver' : 'Rejeter'} « {actionTarget.name} »</h2><p className="mt-2 text-sm text-gray-500">{actionTarget.status === 'rejected' ? 'Le motif sera visible par l’créateur.' : 'Une remarque reste facultative.'}</p><textarea rows={4} value={reason} onChange={e => setReason(e.target.value)} className="mt-4 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-solar" placeholder="Motif ou remarque"/><div className="mt-4 flex gap-2"><button onClick={confirmAction} className="rounded-xl bg-solar px-5 py-2.5 font-bold text-white">Confirmer</button><button onClick={() => setActionTarget(null)} className="rounded-xl bg-gray-100 px-5 py-2.5 font-bold text-gray-600">Annuler</button></div></div></div>}

    <header className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-solar">Confiance & qualité</p><h1 className="mt-1 flex items-center gap-3 font-display text-4xl font-bold"><ShieldCheck className="text-solar"/>File de modération</h1><p className="mt-2 text-gray-500">Une vue unifiée des expériences, établissements et expériences datées.</p></div><div className="flex gap-2"><button onClick={() => setTab('pending')} className={`rounded-xl px-4 py-2 text-sm font-bold ${tab === 'pending' ? 'bg-solar text-white' : 'border bg-white'}`}>À traiter ({pendingCount})</button><button onClick={() => setTab('all')} className={`rounded-xl px-4 py-2 text-sm font-bold ${tab === 'all' ? 'bg-solar text-white' : 'border bg-white'}`}>Historique global</button></div></header>

    <div className="mb-6 grid gap-2 sm:grid-cols-3">{([
      ['experiences','Expériences',Sparkles,experiences.length],['establishments','Établissements',Store,ests.length],['events','Expériences datées',Calendar,events.length]
    ] as const).map(([key,label,Icon,count]) => <button key={key} onClick={() => setSection(key)} className={`flex items-center justify-between rounded-2xl px-5 py-4 text-left ${section === key ? 'bg-anthracite text-white' : 'border bg-white text-gray-600'}`}><span className="flex items-center gap-3 font-bold"><Icon size={18}/>{label}</span><span className="rounded-full bg-white/15 px-2 py-1 text-xs">{count}</span></button>)}</div>

    {loadError && <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{loadError}</div>}
    {loading ? <div className="py-20 text-center">Chargement…</div> : <div className="space-y-4">
      {section === 'experiences' && (experiences.length ? experiences.map(x => <article key={x.id} className="rounded-3xl border border-gray-100 bg-white p-5"><div className="flex gap-4">{x.images[0] && <img src={x.images[0]} alt={x.title} className="h-24 w-24 rounded-2xl object-cover"/>}<div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-xs font-bold uppercase text-solar">{x.category}</p><h2 className="font-display text-xl font-bold">{x.title}</h2><p className="text-sm text-gray-500">{x.city} · par {x.ownerName || x.ownerId}</p></div><StatusBadge status={x.status || 'pending'}/></div><p className="mt-2 line-clamp-3 text-sm text-gray-600">{x.description}</p><Actions kind="experience" id={x.id} name={x.title} status={x.status || 'pending'} note={x.moderationNote}/></div></div></article>) : empty)}
      {section === 'establishments' && (ests.length ? ests.map(x => <article key={x.id} className="rounded-3xl border border-gray-100 bg-white p-5"><div className="flex gap-4">{x.images[0] && <img src={x.images[0]} alt={x.name} className="h-24 w-24 rounded-2xl object-cover"/>}<div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-display text-xl font-bold">{x.name}</h2><p className="text-sm text-gray-500">{x.category} · {x.city} · par {x.ownerName || x.ownerId}</p></div><StatusBadge status={x.status}/></div><p className="mt-2 line-clamp-3 text-sm text-gray-600">{x.description}</p><Actions kind="establishment" id={x.id} name={x.name} status={x.status} note={x.moderationNote}/></div></div></article>) : empty)}
      {section === 'events' && (events.length ? events.map(x => <article key={x.id} className="rounded-3xl border border-gray-100 bg-white p-5"><div className="flex gap-4">{x.images[0] && <img src={x.images[0]} alt={x.title} className="h-24 w-24 rounded-2xl object-cover"/>}<div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-display text-xl font-bold">{x.title}</h2><p className="text-sm text-gray-500">{new Date(x.startDate).toLocaleDateString('fr-FR')} · {x.city} · par {x.organizerName || x.organizerId}</p></div><StatusBadge status={x.status}/></div><p className="mt-2 line-clamp-3 text-sm text-gray-600">{x.description}</p><Actions kind="event" id={x.id} name={x.title} status={x.status} note={x.moderationNote}/></div></div></article>) : empty)}
    </div>}
  </div>;
}

export default function ModerationPage(){return <main className="site-container py-10"><AuthGuard allowedRoles={['admin','super_admin','moderator']}><ModerationContent/></AuthGuard></main>}
