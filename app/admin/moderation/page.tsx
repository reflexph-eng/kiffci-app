'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import StatusBadge from '@/components/StatusBadge';
import { getPendingEstablishments, getPendingEvents, moderateEstablishment, moderateEvent, getAllEstablishmentsAdmin, getAllEventsAdmin } from '@/lib/partner-firestore';
import { Establishment, KiffEvent } from '@/types';
import { Check, X, Store, Calendar, Eye } from 'lucide-react';

type Tab = 'pending' | 'all';

function ModerationContent() {
  const [tab,      setTab]      = useState<Tab>('pending');
  const [estTab,   setEstTab]   = useState<'establishments' | 'events'>('establishments');
  const [ests,     setEsts]     = useState<Establishment[]>([]);
  const [events,   setEvents]   = useState<KiffEvent[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [acting,   setActing]   = useState<string | null>(null);
  const [toast,    setToast]    = useState('');
  const [toastErr, setToastErr] = useState(false);

  function showToast(msg: string, err = false) {
    setToast(msg); setToastErr(err);
    setTimeout(() => setToast(''), 3000);
  }

  async function load() {
    setLoading(true);
    if (tab === 'pending') {
      const [e, ev] = await Promise.all([getPendingEstablishments(), getPendingEvents()]);
      setEsts(e); setEvents(ev);
    } else {
      const [e, ev] = await Promise.all([getAllEstablishmentsAdmin(), getAllEventsAdmin()]);
      setEsts(e); setEvents(ev);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [tab]);

  async function actEst(id: string, status: 'approved' | 'rejected') {
    setActing(id);
    try {
      await moderateEstablishment(id, status);
      showToast(status === 'approved' ? '✅ Établissement approuvé' : '❌ Établissement rejeté', status === 'rejected');
      load();
    } catch { showToast('Erreur', true); }
    finally { setActing(null); }
  }

  async function actEvt(id: string, status: 'approved' | 'rejected') {
    setActing(id);
    try {
      await moderateEvent(id, status);
      showToast(status === 'approved' ? '✅ Événement approuvé' : '❌ Événement rejeté', status === 'rejected');
      load();
    } catch { showToast('Erreur', true); }
    finally { setActing(null); }
  }

  const pendingCount = ests.filter(e => e.status === 'pending').length + events.filter(e => e.status === 'pending').length;

  return (
    <div>
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-2xl shadow-soft font-semibold animate-fadeUp ${toastErr ? 'bg-red-600' : 'bg-anthracite'} text-white`}>
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-4xl text-anthracite">Modération</h1>
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

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setEstTab('establishments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition ${estTab === 'establishments' ? 'bg-anthracite text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
          <Store size={15} /> Établissements ({ests.length})
        </button>
        <button onClick={() => setEstTab('events')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition ${estTab === 'events' ? 'bg-anthracite text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
          <Calendar size={15} /> Événements ({events.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-solar border-t-transparent rounded-full animate-spin" />
        </div>
      ) : estTab === 'establishments' ? (
        ests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-4xl shadow-card">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-gray-500">Aucun établissement à modérer.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ests.map(e => (
              <div key={e.id} className="bg-white rounded-3xl shadow-card p-5">
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
                  </div>
                </div>
                {(e.status === 'pending' || tab === 'all') && (
                  <div className="mt-4 flex gap-3">
                    <button onClick={() => actEst(e.id, 'approved')} disabled={acting === e.id}
                      className="flex items-center gap-2 px-5 py-2.5 bg-tropical text-white rounded-2xl font-bold text-sm hover:bg-green-600 transition disabled:opacity-60">
                      {acting === e.id ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={16} />}
                      Approuver
                    </button>
                    <button onClick={() => actEst(e.id, 'rejected')} disabled={acting === e.id}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-700 transition disabled:opacity-60">
                      <X size={16} /> Rejeter
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        events.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-4xl shadow-card">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-gray-500">Aucun événement à modérer.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map(e => (
              <div key={e.id} className="bg-white rounded-3xl shadow-card p-5">
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
                  </div>
                </div>
                {(e.status === 'pending' || tab === 'all') && (
                  <div className="mt-4 flex gap-3">
                    <button onClick={() => actEvt(e.id, 'approved')} disabled={acting === e.id}
                      className="flex items-center gap-2 px-5 py-2.5 bg-tropical text-white rounded-2xl font-bold text-sm hover:bg-green-600 transition disabled:opacity-60">
                      {acting === e.id ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={16} />}
                      Approuver
                    </button>
                    <button onClick={() => actEvt(e.id, 'rejected')} disabled={acting === e.id}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-700 transition disabled:opacity-60">
                      <X size={16} /> Rejeter
                    </button>
                  </div>
                )}
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
      <AuthGuard adminOnly>
        <ModerationContent />
      </AuthGuard>
    </main>
  );
}
