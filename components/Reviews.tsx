'use client';
/**
 * Reviews — résumé + formulaire + liste, réutilisable pour toute fiche.
 * Un utilisateur connecté ne peut laisser qu'un seul avis par fiche.
 */
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getVisibleReviews, getReviewSummary, getUserReview, createReview, flagReview,
} from '@/lib/reviews-firestore';
import { Review, ReviewTargetType, ReviewSummary } from '@/types';
import StarRating from './StarRating';
import { Star, Flag, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface Props {
  targetType: ReviewTargetType;
  targetId:   string;
  targetName: string;
}

export default function Reviews({ targetType, targetId, targetName }: Props) {
  const { appUser, firebaseUser } = useAuth();
  const [summary, setSummary]   = useState<ReviewSummary>({ average: 0, count: 0 });
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [loading, setLoading]   = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating]     = useState(5);
  const [comment, setComment]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);

  async function refresh() {
    const [s, r] = await Promise.all([
      getReviewSummary(targetType, targetId),
      getVisibleReviews(targetType, targetId),
    ]);
    setSummary(s); setReviews(r);
    if (firebaseUser) setMyReview(await getUserReview(targetType, targetId, firebaseUser.uid));
    setLoading(false);
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [targetType, targetId, firebaseUser]);

  async function handleSubmit() {
    if (!appUser || !firebaseUser) return;
    if (!comment.trim()) { setError('Écris un petit mot avant d\'envoyer.'); return; }
    setSubmitting(true); setError('');
    try {
      await createReview({
        targetType, targetId, targetName,
        userId: firebaseUser.uid, userName: appUser.displayName || 'Utilisateur',
        userPhoto: appUser.photoURL, rating, comment: comment.trim(),
      });
      setShowForm(false); setComment(''); setRating(5);
      await refresh();
    } catch (submitError) {
      console.error('createReview a échoué :', submitError);
      setError('Impossible d\'envoyer ton avis. Réessaie.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFlag(reviewId: string) {
    if (flaggedIds.includes(reviewId)) return;
    await flagReview(reviewId).catch(() => {});
    setFlaggedIds(prev => [...prev, reviewId]);
  }

  if (loading) {
    return <div className="h-24 bg-gray-50 rounded-2xl animate-pulse" />;
  }

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="font-display font-bold text-xl text-anthracite flex items-center gap-2">
            <MessageSquare size={18} className="text-solar" aria-hidden /> Avis
          </h2>
          {summary.count > 0 ? (
            <div className="flex items-center gap-2 mt-1">
              <StarRating value={summary.average} />
              <span className="text-sm text-gray-500">{summary.average.toFixed(1)} · {summary.count} avis</span>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mt-1">Aucun avis pour le moment — sois le premier !</p>
          )}
        </div>

        {!firebaseUser ? (
          <Link href="/login" className="text-sm font-medium text-solar hover:underline">
            Se connecter pour laisser un avis
          </Link>
        ) : myReview ? (
          <span className="text-xs text-gray-400">Tu as déjà donné ton avis, merci !</span>
        ) : !showForm ? (
          <button onClick={() => setShowForm(true)}
            className="bg-solar text-white font-medium px-4 py-2 rounded-2xl text-sm hover:bg-orange-600 transition">
            Laisser un avis
          </button>
        ) : null}
      </div>

      {showForm && !myReview && (
        <div className="bg-white rounded-3xl shadow-card p-5 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Ta note</p>
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map(i => (
              <button key={i} type="button" onClick={() => setRating(i)} aria-label={`${i} étoiles`}>
                <Star size={26} className={i <= rating ? 'text-solar fill-solar' : 'text-gray-200 fill-gray-200'} />
              </button>
            ))}
          </div>
          <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
            placeholder="Qu'as-tu pensé de ton expérience ?"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm mb-3" />
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <div className="flex gap-3">
            <button onClick={handleSubmit} disabled={submitting}
              className="bg-solar text-white font-medium px-5 py-2.5 rounded-2xl text-sm hover:bg-orange-600 transition disabled:opacity-50">
              {submitting ? 'Envoi…' : 'Publier mon avis'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="bg-gray-100 text-gray-600 font-medium px-5 py-2.5 rounded-2xl text-sm hover:bg-gray-200 transition">
              Annuler
            </button>
          </div>
        </div>
      )}

      {reviews.length === 0 ? null : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-white rounded-3xl shadow-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {r.userPhoto
                    ? <img src={r.userPhoto} alt="" className="w-9 h-9 rounded-full object-cover" />
                    : <div className="w-9 h-9 rounded-full bg-sand flex items-center justify-center text-sm font-bold text-solar">
                        {r.userName.charAt(0).toUpperCase()}
                      </div>}
                  <div>
                    <p className="text-sm font-bold text-anthracite">{r.userName}</p>
                    <div className="flex items-center gap-2">
                      <StarRating value={r.rating} size={11} />
                      <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleFlag(r.id)} disabled={flaggedIds.includes(r.id)}
                  aria-label="Signaler cet avis"
                  className="text-gray-300 hover:text-red-500 transition disabled:opacity-40 disabled:hover:text-gray-300">
                  <Flag size={14} aria-hidden />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
