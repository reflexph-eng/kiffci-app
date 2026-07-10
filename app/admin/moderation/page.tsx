'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import {
  getPendingEstablishments, getPendingEvents, getAllEstablishmentsAdmin, getAllEventsAdmin,
} from '@/lib/partner-firestore';
import { moderateWithReason, getModerationHistory } from '@/lib/moderation-firestore';
import { Establishment, KiffEvent, ModerationLog, Status } from '@/types';
import { Check, X, Store, Calendar, History, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

type Tab = 'pending' | 'all';
type Kind = 'establishment' | 'event';
type ActionTarget = { kind: Kind; id: string; name: string; status: Status } | null;

function ModerationContent() {
  const { appUser } = useAuth();
  const [tab,      setTab]      = useState<Tab>('pending');
  const [estTab,   setEstTab]   = useState<'establishments' | 'events'>('establishments');
  const [ests,     setEsts]     = useState<Establishment[]>([]);
  const [events,   setEvents]   = useState<KiffEvent[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [busy,     setBusy]     = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');
  const [toast,    setToast]    = useState('');
  const [toastErr, setToastErr] = useState(false);

  const [actionTarget, setActionTarget] = useState<ActionTarget>(null);
  const [reason, setReason]     = useState('');
  const [openHistory, setOpenHistory] = useState<string | null>(null);
  const [history, setHistory]   = useState<ModerationLog[]>([]);

  function showToast(msg: string, err = false) {
    setToast(msg); setToastErr(err);
    setTimeout(() => setToast(''), 3000);
  }

  async function load() {
    setLoading(true);
    setLoadError('');
    try {
      if (tab === 'pending') {
        const [e, ev] = await Promise.all([getPendingEstablishments(), getPendingEvents()]);
        setEsts(e); setEvents(ev);
      } else {
        const [e, ev] = await Promise.all([getAllEstablishmentsAdmin(), getAllEventsAdmin()]);
        setEsts(e); setEvents(ev);
      }
    } catch (error) {
      console.error('[Moderation] Chargement impossible.', error);
      setEsts([]); setEvents([]);
      setLoadError("Impossible de charger la modération. Vérifie que ton compte a le rôle Admin ou Modérateur et que les règles Firestore sont bien déployées.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [tab]);

  function openAction(kind: Kind, id: string, name: string, status: Status) {
    setActionTarget({ kind, id, name, status });
    setReason('');
  }

  async function confirmAction() {
    if (!actionTarget || !appUser) return;
    if (actionTarget.status === 'rejected' && !reason.trim()) {
      showToast('Le motif est obligatoire pour un rejet.', true);
      return;
    }
    setBusy(actionTarget.id);
    try {
      await moderateWithReason(
        actionTarget.kind, actionTarget.id, actionTarget.name, actionTarget.status,
        reason.trim(), appUser.uid, appUser.displayName || appUser.email
      );
      showToast(actionTarget.status === 'approved' ? '✅ Publication approuvée' : '❌ Publication rejetée', actionTarget.status === 'rejected');
      setActionTarget(null);
      await load();
    } catch (error) {
      console.error('[Moderation] Action impossible.', error);
      showToast("Erreur lors de la modération. Vérifie les droits du compte.", true);
    } finally {
      setBusy(null);
    }
  }

  async function toggleHistory(kind: Kind, id: string) {
    if (openHistory === id) { setOpenHistory(null); return; }
    setOpenHistory(id);
    try {
      setHistory(await getModerationHistory(kind, id));
    } catch (error) {
      console.error('[Moderation] Historique inaccessible.', error);
      setHistory([]);
      showToast("Historique indisponible pour ce compte.", true);
    }
  }

  const pendingCount = ests.filter(e => e.status === 'pending').length + events.filter(e => e.status === 'pending').length;

  function ActionButtons({ kind, id, name, status, note }: { kind: Kind; id: string; name: string; status: Status; note?: string }) {
    return (
      <>
        {(status === 'pending' || tab === 'all') && (
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => openAction(kind, id, name, 'approved')} disabled={busy === id}
              className="flex items-center gap-2 px-5 py-2.5 bg-tropical text-white rounded-2xl font-bold text-sm hover:bg-green-600 transition disabled:opacity-60">
              <Check size={16} aria-hidden /> Approuver
            </button>
            <button onClick={() => openAction(kind, id, name, 'rejected')} disabled={busy === id}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-700 transition disabled:opacity-60">
              <X size={16} aria-hidden /> Rejeter
            </button>
            <button onClick={() => toggleHistory(kind, id)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-2xl font-medium text-sm hover:bg-gray-200 transition">
              <History size={14} aria-hidden /> Historique
              {openHistory === id ? <ChevronUp size={14} aria-hidden /> : <ChevronDown size={14} aria-hidden />}
            </button>
          </div>
        )}
        {note && status === 'rejected' && (
          <p className="mt-3 text-sm bg-red-50 text-red-700 rounded-xl px-4 py-2.5">
            <span className="font-semibold">Motif du rejet :</span> {note}
          </p>
        )}
        {openHistory === id && (
          <div className="mt-3 bg-gray-50 rounded-2xl p-4 space-y-2">
            {history.length === 0 ? (
              <p className="text-xs text-gray-400">Aucun historique.</p>
            ) : history.map(h => (
              <div key={h.id} className="text-xs text-gray-600 border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                <span className={`font-bold ${h.action === 'approved' ? 'text-tropical' : 'text-red-600'}`}>
                  {h.action === 'approved' ? 'Approuvé' : 'Rejeté'}
                </span>
                {' '}par {h.moderatorName} le {new Date(h.createdAt).toLocaleDateString('fr-FR')}
                {h.reason && <> — <span className="italic">{h.reason}</span></>}
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <div>
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-2xl shadow-soft font-semibold animate-fadeUp ${toastErr ? 'bg-red-600' : 'bg-anthracite'} text-white`}>
          {toast}
        </div>
      )}

      {actionTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <h2 className="font-display font-bold text-lg mb-1">
              {actionTarget.status === 'approved' ? 'Approuver' : 'Rejeter'} « {actionTarget.name} »
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {actionTarget.status === 'rejected'
                ? 'Le motif est obligatoire et sera visible par le partenaire.'
                : 'Vous pouvez ajouter une remarque interne (optionnel).'}
            </p>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
              placeholder={actionTarget.status === 'rejected' ? 'Ex : photos de mauvaise qualité, description incomplète…' : 'Remarque (optionnel)'}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm mb-4" />
            <div className="flex gap-3">
              <button onClick={confirmAction} disabled={busy === actionTarget.id}
                className={`font-medium px-5 py-2.5 rounded-2xl transition text-sm text-white disabled:opacity-60 ${
                  actionTarget.status === 'approved' ? 'bg-tropical hover:bg-green-600' : 'bg-red-600 hover:bg-red-700'}`}>
                {busy === actionTarget.id ? 'Enregistrement…' : 'Confirmer'}
              </button>
              <button onClick={() => setActionTarget(null)}
                className="bg-gray-100 text-gray-600 font-medium px-5 py-2.5 rounded-2xl hover:bg-gray-200 transition text-sm">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-4xl text-anthracite flex items-center gap-3">
            <ShieldCheck className="text-solar" aria-hidden /> Modération
          </h1>
          {pendingCount > 0 && (
            <p className="text-solar font-semibold mt-1">⏳ {pendingCount} publication{pendingCount > 1 ? 's' : ''} en attente</p>
          )}
        </div>
        <div className="flex gap-2">
          {(['pending', 'all'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-2xl text-sm font-bold transition ${tab === t ? 'bg-solar text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {t === 'pending' ? `En attente (${pendingCount})` : 'Tout voir'}
            </button>
          ))}
        </div>
      </div>

      {loadError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <button onClick={() => setEstTab('establishments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition ${estTab === 'establishments' ? 'bg-anthracite text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
          <Store size={15} aria-hidden /> Établissements ({ests.length})
        </button>
        <button onClick={() => setEstTab('events')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition ${estTab === 'events' ? 'bg-anthracite text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
          <Calendar size={15} aria-hidden /> Événements ({events.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-solar border-t-transparent rounded-full animate-spin" />
        </div>
      ) : estTab === 'establishments' ? (
        ests.length === 0 ? (
          <div className="text-center py-16 border border-gray-100 rounded-2xl">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-gray-500">Aucun établissement à modérer.</p>
          </div>
        ) : (
          <div className="border border-gray-100 rounded-2xl divide-y divide-gray-100 bg-white overflow-hidden">
            {ests.map(e => (
              <div key={e.id} className="p-5 hover:bg-gray-50/60 transition">
                <div className="flex items-start gap-4">
                  {e.images[0] && <img src={e.images[0]} alt={e.name} className="w-20 h-20 rounded-2xl object-cover shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h3 className="font-display font-bold text-lg">{e.name}</h3>
                        <p className="text-sm text-gray-500">{e.category} · {e.district}, {e.city}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Par : {e.ownerName ?? e.ownerId}</p>
                      </div>
                      <StatusBadge status={e.status} />
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">{e.description}</p>
                    <div className="mt-2 text-xs text-gray-400">
                      📞 {e.phone} · 💬 {e.whatsapp} · 📧 {e.email}
                    </div>
                    {e.images.length > 1 && (
                      <div className="mt-3 flex gap-2">
                        {e.images.slice(1).map(img => (
                          <img key={img} src={img} alt="" className="w-12 h-12 rounded-xl object-cover" />
                        ))}
                      </div>
                    )}
                    <ActionButtons kind="establishment" id={e.id} name={e.name} status={e.status} note={e.moderationNote} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        events.length === 0 ? (
          <div className="text-center py-16 border border-gray-100 rounded-2xl">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-gray-500">Aucun événement à modérer.</p>
          </div>
        ) : (
          <div className="border border-gray-100 rounded-2xl divide-y divide-gray-100 bg-white overflow-hidden">
            {events.map(e => (
              <div key={e.id} className="p-5 hover:bg-gray-50/60 transition">
                <div className="flex items-start gap-4">
                  {e.images[0] && <img src={e.images[0]} alt={e.title} className="w-20 h-20 rounded-2xl object-cover shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h3 className="font-display font-bold text-lg">{e.title}</h3>
                        <p className="text-sm text-gray-500">
                          📅 {new Date(e.startDate).toLocaleDateString('fr-FR')} → {new Date(e.endDate).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-sm text-gray-500">📍 {e.location}, {e.city} · 💰 {e.price}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Par : {e.organizerName ?? e.organizerId}</p>
                      </div>
                      <StatusBadge status={e.status} />
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">{e.description}</p>
                    <ActionButtons kind="event" id={e.id} name={e.title} status={e.status} note={e.moderationNote} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default function ModerationPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <AuthGuard allowedRoles={['admin', 'super_admin', 'moderator']}>
        <ModerationContent />
      </AuthGuard>
    </main>
  );
}
