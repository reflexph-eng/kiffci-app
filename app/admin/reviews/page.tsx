'use client';
/** /admin/reviews — modération des avis signalés (Sprint 4). */
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { getFlaggedReviews, getAllReviewsAdmin, setReviewHidden, deleteReview } from '@/lib/reviews-firestore';
import { Review } from '@/types';
import StarRating from '@/components/StarRating';
import { Flag, EyeOff, Eye, Trash2, MessageSquare } from 'lucide-react';

type Tab = 'flagged' | 'all';

export default function AdminReviewsPage() {
  const [tab, setTab]         = useState<Tab>('flagged');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    setReviews(tab === 'flagged' ? await getFlaggedReviews() : await getAllReviewsAdmin());
    setLoading(false);
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [tab]);

  async function toggleHide(r: Review) {
    await setReviewHidden(r.id, !r.isHidden);
    await refresh();
  }

  async function handleDelete(r: Review) {
    if (!confirm(`Supprimer définitivement l'avis de ${r.userName} ?`)) return;
    await deleteReview(r.id);
    await refresh();
  }

  return (
    <AuthGuard adminOnly>
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="font-display font-bold text-3xl text-anthracite flex items-center gap-2 mb-2">
          <MessageSquare className="text-solar" aria-hidden /> Modération des avis
        </h1>
        <p className="text-gray-500 text-sm mb-6">Les avis masqués ne s'affichent plus sur les fiches publiques.</p>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('flagged')}
            className={`px-4 py-2 rounded-2xl text-sm font-bold transition ${tab === 'flagged' ? 'bg-solar text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            Signalés
          </button>
          <button onClick={() => setTab('all')}
            className={`px-4 py-2 rounded-2xl text-sm font-bold transition ${tab === 'all' ? 'bg-solar text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            Tous les avis
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Chargement…</p>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-4xl shadow-card">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-gray-500">{tab === 'flagged' ? 'Aucun avis signalé.' : 'Aucun avis pour le moment.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className={`bg-white rounded-3xl shadow-card p-5 ${r.isHidden ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-bold text-anthracite flex items-center gap-2">
                      {r.userName}
                      {r.isFlagged && !r.isHidden && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Flag size={9} aria-hidden /> Signalé
                        </span>
                      )}
                      {r.isHidden && (
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Masqué</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">sur « {r.targetName} » ({r.targetType}) · {new Date(r.createdAt).toLocaleDateString('fr-FR')}</p>
                    <StarRating value={r.rating} size={12} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleHide(r)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition ${
                        r.isHidden ? 'bg-tropical/10 text-tropical hover:bg-tropical/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {r.isHidden ? <Eye size={13} aria-hidden /> : <EyeOff size={13} aria-hidden />}
                      {r.isHidden ? 'Réafficher' : 'Masquer'}
                    </button>
                    <button onClick={() => handleDelete(r)}
                      className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white transition">
                      <Trash2 size={14} aria-hidden />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
