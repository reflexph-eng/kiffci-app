/**
 * lib/rewards-firestore.ts — Palier 1 : accès prioritaire + tirage au sort (Sprint 6)
 */
import {
  collection, doc, getDoc, getDocs, addDoc, setDoc, query, where, orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { getAllUsersAdmin } from './users-admin';
import { RaffleWinner, RewardsSettings, AppUser } from '@/types';
import { levelFromPoints } from './utils';

const REWARDS_MIN_LEVEL_ORDER = ['Curieux', 'Explorateur', 'Aventurier', 'Connaisseur', "Expert Côte d'Ivoire", 'Légende KIFFCI'];

export const DEFAULT_REWARDS_SETTINGS: RewardsSettings = {
  currentPrize: 'Un bon cadeau à définir',
  eligibilityMinLevel: 'Explorateur',
  updatedAt: 0,
};

export async function getRewardsSettings(): Promise<RewardsSettings> {
  const snap = await getDoc(doc(db, 'appSettings', 'rewards'));
  if (!snap.exists()) return DEFAULT_REWARDS_SETTINGS;
  return { ...DEFAULT_REWARDS_SETTINGS, ...(snap.data() as Partial<RewardsSettings>) };
}

export async function updateRewardsSettings(data: Partial<RewardsSettings>): Promise<void> {
  await setDoc(doc(db, 'appSettings', 'rewards'), { ...data, updatedAt: Date.now() }, { merge: true });
}

function currentPeriod(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Utilisateurs éligibles au tirage du mois : niveau atteint >= seuil configuré. */
export async function getEligibleUsersForRaffle(): Promise<AppUser[]> {
  const [users, settings] = await Promise.all([getAllUsersAdmin(), getRewardsSettings()]);
  const minIdx = REWARDS_MIN_LEVEL_ORDER.indexOf(settings.eligibilityMinLevel);
  return users.filter(u => {
    if (u.isSuspended) return false;
    const idx = REWARDS_MIN_LEVEL_ORDER.indexOf(levelFromPoints(u.points).level);
    return idx >= (minIdx === -1 ? 1 : minIdx);
  });
}

export async function getRaffleWinners(period?: string): Promise<RaffleWinner[]> {
  const q = period
    ? query(collection(db, 'raffleWinners'), where('period', '==', period))
    : query(collection(db, 'raffleWinners'), orderBy('drawnAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as RaffleWinner));
}

export async function drawRaffleWinner(
  winner: AppUser, prize: string, actorId: string
): Promise<string> {
  const ref = await addDoc(collection(db, 'raffleWinners'), {
    period: currentPeriod(),
    userId: winner.uid,
    userName: winner.displayName || winner.email,
    prize,
    drawnAt: Date.now(),
    drawnBy: actorId,
  });
  return ref.id;
}

export function hasWinnerThisPeriod(winners: RaffleWinner[]): boolean {
  return winners.some(w => w.period === currentPeriod());
}

export { currentPeriod };
