/**
 * lib/firestore.ts
 * Toutes les fonctions CRUD Firestore pour KIFFCI.
 */
import {
  collection, doc, getDoc, getDocs, addDoc, setDoc,
  updateDoc, deleteDoc, query, where, orderBy,
  serverTimestamp, Timestamp, writeBatch, increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { Experience, Challenge, AppUser, Favorite, CompletedExperience } from '@/types';
import { levelFromPoints, BADGE_DEFINITIONS } from './utils';

// ─── Helpers ────────────────────────────────────────────────────────────────

function toNumber(v: unknown): number {
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === 'number') return v;
  return Date.now();
}

function docToExperience(id: string, data: Record<string, unknown>): Experience {
  return {
    id,
    title:          (data.title as string)       ?? '',
    description:    (data.description as string) ?? '',
    category:       (data.category as string)    ?? '',
    mood:           (data.mood as string[])       ?? [],
    city:           (data.city as string)         ?? '',
    district:       (data.district as string)     ?? '',
    latitude:       (data.latitude as number)     ?? 0,
    longitude:      (data.longitude as number)    ?? 0,
    duration:       (data.duration as string)     ?? '',
    priceMin:       (data.priceMin as number)     ?? 0,
    priceMax:       (data.priceMax as number)     ?? 0,
    priceText:      (data.priceText as string)    ?? '',
    openingHours:   (data.openingHours as string) ?? '',
    contactPhone:   (data.contactPhone as string) ?? '',
    whatsapp:       (data.whatsapp as string)     ?? '',
    email:          data.email as string | undefined,
    images:         (data.images as string[])     ?? [],
    tags:           (data.tags as string[])       ?? [],
    suitableFor:    (data.suitableFor as Experience['suitableFor']) ?? [],
    bestMoment:     (data.bestMoment as string[]) ?? [],
    isFree:         (data.isFree as boolean)      ?? false,
    isPremium:      (data.isPremium as boolean)   ?? false,
    isSponsored:    (data.isSponsored as boolean) ?? false,
    isPublished:    (data.isPublished as boolean) ?? true,
    bookingLink:    data.bookingLink as string | undefined,
    views:          (data.views as number) ?? 0,
    createdAt:      toNumber(data.createdAt),
    updatedAt:      toNumber(data.updatedAt),
  };
}

// ─── Experiences ─────────────────────────────────────────────────────────────

export async function getExperiences(): Promise<Experience[]> {
  const q = query(
    collection(db, 'experiences'),
    where('isPublished', '==', true),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToExperience(d.id, d.data() as Record<string, unknown>));
}

export async function getAllExperiencesAdmin(): Promise<Experience[]> {
  const snap = await getDocs(collection(db, 'experiences'));
  return snap.docs.map((d) => docToExperience(d.id, d.data() as Record<string, unknown>));
}

export async function getExperienceById(id: string): Promise<Experience | null> {
  const snap = await getDoc(doc(db, 'experiences', id));
  if (!snap.exists()) return null;
  return docToExperience(snap.id, snap.data() as Record<string, unknown>);
}

export async function trackExperienceView(id: string): Promise<void> {
  await updateDoc(doc(db, 'experiences', id), { views: increment(1) }).catch(() => {});
}

export async function createExperience(
  data: Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'experiences'), {
    ...data,
    isPublished: data.isPublished ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateExperience(
  id: string,
  data: Partial<Omit<Experience, 'id' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, 'experiences', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteExperience(id: string): Promise<void> {
  await deleteDoc(doc(db, 'experiences', id));
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function createUserDoc(
  uid: string,
  email: string,
  displayName: string
): Promise<void> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      email,
      displayName,
      role: 'user',
      points: 0,
      level: 'Curieux',
      badges: [],
      createdAt: serverTimestamp(),
    });
  }
}

export async function getUserDoc(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    uid:         d.uid,
    email:       d.email,
    displayName: d.displayName,
    photoURL:    d.photoURL,
    role:        d.role ?? 'user',
    points:      d.points ?? 0,
    level:       d.level  ?? 'Curieux',
    badges:      d.badges ?? [],
    createdAt:   toNumber(d.createdAt),
  };
}

// ─── Favorites ───────────────────────────────────────────────────────────────

export async function getFavorites(userId: string): Promise<string[]> {
  const q = query(collection(db, 'favorites'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data().experienceId as string);
}

export async function addFavorite(userId: string, experienceId: string): Promise<void> {
  const favId = `${userId}_${experienceId}`;
  await setDoc(doc(db, 'favorites', favId), {
    userId,
    experienceId,
    createdAt: serverTimestamp(),
  });
}

export async function removeFavorite(userId: string, experienceId: string): Promise<void> {
  const favId = `${userId}_${experienceId}`;
  await deleteDoc(doc(db, 'favorites', favId));
}

export async function getFavoriteExperiences(userId: string): Promise<Experience[]> {
  const ids = await getFavorites(userId);
  if (ids.length === 0) return [];
  const results = await Promise.all(ids.map((id) => getExperienceById(id)));
  return results.filter(Boolean) as Experience[];
}

// ─── Completed Experiences ───────────────────────────────────────────────────

const POINTS_PER_EXPERIENCE = 50;

export async function getCompletedIds(userId: string): Promise<string[]> {
  const q = query(
    collection(db, 'completedExperiences'),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data().experienceId as string);
}

export async function markExperienceCompleted(
  userId: string,
  experienceId: string
): Promise<{ alreadyDone: boolean; pointsEarned: number }> {
  const completedId = `${userId}_${experienceId}`;
  const ref = doc(db, 'completedExperiences', completedId);
  const snap = await getDoc(ref);

  if (snap.exists()) return { alreadyDone: true, pointsEarned: 0 };

  const batch = writeBatch(db);

  // 1. Enregistrer l'expérience complétée
  batch.set(ref, {
    userId,
    experienceId,
    pointsEarned: POINTS_PER_EXPERIENCE,
    completedAt: serverTimestamp(),
  });

  // 2. Mettre à jour les points et le niveau de l'utilisateur
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const currentPoints = (userSnap.data().points as number) ?? 0;
    const newPoints = currentPoints + POINTS_PER_EXPERIENCE;
    const { level } = levelFromPoints(newPoints);

    // 3. Calculer les nouveaux badges
    const completedIds = await getCompletedIds(userId);
    completedIds.push(experienceId);
    const experiences = await Promise.all(completedIds.map(getExperienceById));
    const newBadges = computeEarnedBadges(
      experiences.filter(Boolean) as Experience[],
      userSnap.data().badges as string[] ?? []
    );

    batch.update(userRef, {
      points: newPoints,
      level,
      badges: newBadges,
    });
  }

  await batch.commit();
  return { alreadyDone: false, pointsEarned: POINTS_PER_EXPERIENCE };
}

function computeEarnedBadges(
  completedExperiences: Experience[],
  currentBadges: string[]
): string[] {
  const earned = new Set(currentBadges);
  for (const badge of BADGE_DEFINITIONS) {
    if (earned.has(badge.id)) continue;
    const { type, category, count } = badge.condition;
    if (type === 'category' && category) {
      const n = completedExperiences.filter((e) => e.category === category).length;
      if (n >= count) earned.add(badge.id);
    } else if (type === 'count') {
      if (completedExperiences.length >= count) earned.add(badge.id);
    }
  }
  return Array.from(earned);
}

// ─── Challenges ──────────────────────────────────────────────────────────────

export async function getChallenges(): Promise<Challenge[]> {
  const snap = await getDocs(collection(db, 'challenges'));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id:           d.id,
      title:        data.title,
      description:  data.description,
      rewardPoints: data.rewardPoints,
      experiences:  data.experiences ?? [],
      category:     data.category,
    };
  });
}

export async function createChallenge(data: Omit<Challenge, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'challenges'), data);
  return ref.id;
}

export async function updateChallenge(id: string, data: Partial<Challenge>): Promise<void> {
  await updateDoc(doc(db, 'challenges', id), data);
}

export async function deleteChallenge(id: string): Promise<void> {
  await deleteDoc(doc(db, 'challenges', id));
}

export async function checkAndRewardChallenge(
  userId: string,
  challenge: Challenge,
  completedIds: string[]
): Promise<boolean> {
  const allDone = challenge.experiences.every((id) => completedIds.includes(id));
  if (!allDone) return false;

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return false;

  const data = userSnap.data();
  const completedChallenges: string[] = data.completedChallenges ?? [];
  if (completedChallenges.includes(challenge.id)) return false;

  const newPoints = (data.points as number ?? 0) + challenge.rewardPoints;
  const { level } = levelFromPoints(newPoints);
  await updateDoc(userRef, {
    points: newPoints,
    level,
    completedChallenges: [...completedChallenges, challenge.id],
  });
  return true;
}

// ─── Seed ────────────────────────────────────────────────────────────────────

export async function seedDemoData(
  experiencesData: Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>[],
  challengesData: Omit<Challenge, 'id'>[]
): Promise<void> {
  const batch = writeBatch(db);

  for (const exp of experiencesData) {
    const ref = doc(collection(db, 'experiences'));
    batch.set(ref, {
      ...exp,
      isPublished: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  for (const ch of challengesData) {
    const ref = doc(collection(db, 'challenges'));
    batch.set(ref, ch);
  }

  await batch.commit();
}
