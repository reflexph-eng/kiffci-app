/**
 * lib/notifications.ts — Notifications in-app pour partenaires et admins (Sprint 5)
 * S'appuie sur les collections déjà existantes (moderationLogs, reviews) plutôt
 * que de créer un nouveau pipeline d'événements.
 */
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { getMyEstablishments, getMyEvents } from './partner-firestore';
import { ModerationLog } from '@/types';

const SEEN_KEY_PREFIX = 'kiffci_notifications_seen_at_';

export function getLastSeenAt(uid: string): number {
  if (typeof window === 'undefined') return 0;
  return Number(localStorage.getItem(SEEN_KEY_PREFIX + uid) ?? '0');
}

export function markNotificationsSeen(uid: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SEEN_KEY_PREFIX + uid, String(Date.now()));
}

/** Pour un partenaire : décisions de modération récentes sur ses propres publications. */
export async function getPartnerNotifications(uid: string): Promise<ModerationLog[]> {
  const [ests, events] = await Promise.all([getMyEstablishments(uid), getMyEvents(uid)]);
  const myIds = new Set([...ests.map(e => e.id), ...events.map(e => e.id)]);
  if (myIds.size === 0) return [];

  const snap = await getDocs(collection(db, 'moderationLogs'));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as ModerationLog))
    .filter(log => myIds.has(log.targetId))
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 20);
}

/** Pour un admin : nombre d'éléments nécessitant son attention (file d'attente). */
export async function getAdminPendingCount(): Promise<number> {
  const [estsSnap, eventsSnap, reviewsSnap] = await Promise.all([
    getDocs(query(collection(db, 'establishments'), where('status', '==', 'pending'))),
    getDocs(query(collection(db, 'events'), where('status', '==', 'pending'))),
    getDocs(query(collection(db, 'reviews'), where('isFlagged', '==', true))),
  ]);
  return estsSnap.size + eventsSnap.size + reviewsSnap.size;
}
