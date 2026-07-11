/**
 * lib/reviews-firestore.ts — Avis et notes (Sprint 4)
 */
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';
import { Review, ReviewTargetType, ReviewSummary } from '@/types';

function toReview(id: string, d: Record<string, unknown>): Review {
  return {
    id,
    targetType: (d.targetType as ReviewTargetType) ?? 'establishment',
    targetId:   (d.targetId as string) ?? '',
    targetName: (d.targetName as string) ?? '',
    userId:     (d.userId as string) ?? '',
    userName:   (d.userName as string) ?? 'Utilisateur',
    userPhoto:  d.userPhoto as string | undefined,
    rating:     (d.rating as number) ?? 5,
    comment:    (d.comment as string) ?? '',
    isFlagged:  (d.isFlagged as boolean) ?? false,
    isHidden:   (d.isHidden as boolean) ?? false,
    createdAt:  (d.createdAt as number) ?? Date.now(),
  };
}

function summaryDocId(targetType: ReviewTargetType, targetId: string) {
  return `${targetType}_${targetId}`;
}

/** Avis visibles (non masqués) pour une fiche, du plus récent au plus ancien. */
export async function getVisibleReviews(targetType: ReviewTargetType, targetId: string): Promise<Review[]> {
  const q = query(
    collection(db, 'reviews'),
    where('targetType', '==', targetType), where('targetId', '==', targetId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(d => toReview(d.id, d.data()))
    .filter(r => !r.isHidden)
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** Résumé (moyenne + nombre) précalculé, lecture rapide sans charger tous les avis. */
export async function getReviewSummary(targetType: ReviewTargetType, targetId: string): Promise<ReviewSummary> {
  const snap = await getDoc(doc(db, 'reviewSummaries', summaryDocId(targetType, targetId)));
  if (!snap.exists()) return { average: 0, count: 0 };
  const d = snap.data();
  return { average: (d.average as number) ?? 0, count: (d.count as number) ?? 0 };
}

/** L'utilisateur a-t-il déjà laissé un avis sur cette fiche ? */
export async function getUserReview(targetType: ReviewTargetType, targetId: string, userId: string): Promise<Review | null> {
  const q = query(
    collection(db, 'reviews'),
    where('targetType', '==', targetType), where('targetId', '==', targetId), where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return toReview(snap.docs[0].id, snap.docs[0].data());
}

/** Crée un avis et met à jour l'agrégat (moyenne/nombre) de façon transactionnelle. */
export async function createReview(data: Omit<Review, 'id' | 'isFlagged' | 'isHidden' | 'createdAt'>): Promise<string> {
  const reviewRef = doc(collection(db, 'reviews'));
  const summaryRef = doc(db, 'reviewSummaries', summaryDocId(data.targetType, data.targetId));
  const targetCollection =
    data.targetType === 'establishment' ? 'establishments' :
    data.targetType === 'event' ? 'events' : 'experiences';
  const targetRef = doc(db, targetCollection, data.targetId);

  await runTransaction(db, async (tx) => {
    const summarySnap = await tx.get(summaryRef);
    const prevAvg   = summarySnap.exists() ? (summarySnap.data().average as number) ?? 0 : 0;
    const prevCount = summarySnap.exists() ? (summarySnap.data().count as number) ?? 0 : 0;
    const newCount  = prevCount + 1;
    const newAvg    = Math.round(((prevAvg * prevCount + data.rating) / newCount) * 10) / 10;

    const reviewData = Object.fromEntries(
      Object.entries({ ...data, isFlagged: false, isHidden: false, createdAt: Date.now() })
        .filter(([, value]) => value !== undefined)
    );

    tx.set(reviewRef, reviewData);
    tx.set(summaryRef, {
      targetType: data.targetType, targetId: data.targetId,
      average: newAvg, count: newCount, updatedAt: Date.now(),
    }, { merge: true });
    // Dénormalisation : la note voyage avec la fiche elle-même, pour que les
    // listes/cartes n'aient pas besoin d'une lecture supplémentaire par item.
    tx.set(targetRef, { avgRating: newAvg, reviewCount: newCount }, { merge: true });
  });

  return reviewRef.id;
}

export async function flagReview(reviewId: string): Promise<void> {
  await updateDoc(doc(db, 'reviews', reviewId), { isFlagged: true });
}

// ── Modération (admin) ────────────────────────────────────────────────────────

export async function getFlaggedReviews(): Promise<Review[]> {
  const snap = await getDocs(query(collection(db, 'reviews'), where('isFlagged', '==', true)));
  return snap.docs.map(d => toReview(d.id, d.data())).sort((a, b) => b.createdAt - a.createdAt);
}

export async function getAllReviewsAdmin(): Promise<Review[]> {
  const snap = await getDocs(query(collection(db, 'reviews'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => toReview(d.id, d.data()));
}

/** Masque/démasque un avis (ne recalcule pas l'agrégat pour rester simple ; le masquage reste rare). */
export async function setReviewHidden(reviewId: string, hidden: boolean): Promise<void> {
  await updateDoc(doc(db, 'reviews', reviewId), { isHidden: hidden, isFlagged: false });
}

export async function deleteReview(reviewId: string): Promise<void> {
  await deleteDoc(doc(db, 'reviews', reviewId));
}
