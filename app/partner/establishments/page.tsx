'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { getMyEstablishments, deleteEstablishment, getEstablishmentCode } from '@/lib/partner-firestore';
import { Establishment } from '@/types';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Eye, Phone, MessageCircle, Heart } from 'lucide-react';
import CheckInCodeCard from '@/components/CheckInCodeCard';

function EstablishmentsContent() {
  const { appUser } = useAuth();
  const [ests,    setEsts]    = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [toast,   setToast]   = useState('');

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function load() {
    if (!appUser) return;
    const data = await getMyEstablishments(appUser.uid);
    // Le code de passage n'étant plus sur le document public, on le récupère
    // séparément depuis la collection restreinte (autorisée au propriétaire).
    const withCodes = await Promise.all(
      data.map(async (e) =>
        e.status === 'approved' ? { ...e, checkInCode: await getEstablishmentCode(e.id) } : e
      )
    );
    setEsts(withCodes);
  }

  useEffect(() => { load().finally(() => setLoading(false)); }, [appUser]);

  async function handleDelete(id: string) {
    await deleteEstablishment(id);
    setConfirm(null);
    showToast('Établissement supprimé');
    load();
  }

  if (loading) return <div className="flex justify-center mt-20"><div className="w-10 h-10 border-4 border-solar border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-anthracite text-white px-5 py-3 rounded-2xl shadow-soft font-semibold animate-fadeUp">
          {toast}
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-4xl text-anthracite">Mes établissements</h1>
          <p className="text-gray-500 mt-1">{ests.length} établissement{ests.length > 1 ? 's' : ''}</p>
        </div>
        <Link href="/partner/create-establishment"
          className="bg-solar text-white px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-orange-600 transition">
          <Plus size={16} /> Ajouter
        </Link>
      </div>

      {ests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-4xl shadow-card">
          <p className="text-5xl mb-4">🏪</p>
          <h3 className="font-display font-bold text-xl">Aucun établissement</h3>
          <p className="text-gray-500 mt-2 mb-6">Ajoute ton premier établissement pour apparaître sur Kiffci.</p>
          <Link href="/partner/create-establishment"
            className="bg-solar text-white px-6 py-3 rounded-2xl font-bold hover:bg-orange-600 transition">
            Ajouter un établissement
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {ests.map(e => (
            <div key={e.id} className="bg-white rounded-3xl shadow-card p-5">
              <div className="flex items-start gap-4">
                {e.images[0] && (
                  <img src={e.images[0]} alt={e.name} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-display font-bold text-lg">{e.name}</h3>
                      <p className="text-sm text-gray-500">{e.category} · {e.district}, {e.city}</p>
                    </div>
                    <StatusBadge status={e.status} />
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{e.description}</p>

                  {e.status === 'rejected' && e.moderationNote && (
                    <p className="mt-2 text-sm bg-red-50 text-red-700 rounded-xl px-3 py-2">
                      <span className="font-semibold">Motif du rejet :</span> {e.moderationNote}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="mt-3 flex gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Eye size={12} /> {e.views} vues</span>
                    <span className="flex items-center gap-1"><MessageCircle size={12} /> {e.whatsappClicks} WA</span>
                    <span className="flex items-center gap-1"><Phone size={12} /> {e.phoneClicks} appels</span>
                    <span className="flex items-center gap-1"><Heart size={12} /> {e.favoritesCount} favoris</span>
                  </div>

                  {e.status === 'approved' && (
                    <CheckInCodeCard establishmentId={e.id} code={e.checkInCode ?? ''}
                      onRegenerated={(newCode) => setEsts(prev => prev.map(x => x.id === e.id ? { ...x, checkInCode: newCode } : x))} />
                  )}
                </div>
              </div>

              <div className="mt-4 flex gap-2 flex-wrap">
                <Link href={`/partner/edit-establishment/${e.id}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition">
                  <Edit2 size={14} /> Modifier
                </Link>
                {confirm === e.id ? (
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-gray-500">Confirmer la suppression ?</span>
                    <button onClick={() => handleDelete(e.id)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-sm font-bold">Oui</button>
                    <button onClick={() => setConfirm(null)}
                      className="px-3 py-1.5 bg-gray-100 rounded-xl text-sm">Non</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirm(e.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-red-500 hover:bg-red-50 hover:border-red-200 transition">
                    <Trash2 size={14} /> Supprimer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EstablishmentsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <AuthGuard partnerOnly>
        <EstablishmentsContent />
      </AuthGuard>
    </main>
  );
}
