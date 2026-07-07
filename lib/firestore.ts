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
    linkedEstablishmentId: data.linkedEstablishmentId as string | undefined,
    earlyAccessUntil: data.earlyAccessUntil as number | undefined,
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
// Bonus pour récompenser la certification par code de passage — incite les
// utilisateurs à privilégier la validation fiable plutôt que la déclaration seule.
const CERTIFIED_BONUS_MULTIPLIER = 2;

export async function getCompletedIds(userId: string): Promise<string[]> {
  const q = query(
    collection(db, 'completedExperiences'),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data().experienceId as string);
}

/** Version enrichie : inclut le statut de vérification (déclaration vs code). */
export async function getCompletedRecords(userId: string): Promise<CompletedExperience[]> {
  const q = query(collection(db, 'completedExperiences'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId as string,
      experienceId: data.experienceId as string,
      pointsEarned: (data.pointsEarned as number) ?? 0,
      verified: (data.verified as boolean) ?? false,
      verifiedVia: (data.verifiedVia as 'declaration' | 'code') ?? 'declaration',
      completedAt: toNumber(data.completedAt),
    };
  });
}

async function completeExperienceInternal(
  userId: string,
  experienceId: string,
  verified: boolean,
  verifiedVia: 'declaration' | 'code'
): Promise<{ alreadyDone: boolean; pointsEarned: number }> {
  const completedId = `${userId}_${experienceId}`;
  const ref = doc(db, 'completedExperiences', completedId);
  const snap = await getDoc(ref);

  if (snap.exists()) return { alreadyDone: true, pointsEarned: 0 };

  const pointsEarned = verified ? POINTS_PER_EXPERIENCE * CERTIFIED_BONUS_MULTIPLIER : POINTS_PER_EXPERIENCE;
  const batch = writeBatch(db);

  // 1. Enregistrer l'expérience complétée
  batch.set(ref, {
    userId,
    experienceId,
    pointsEarned,
    verified,
    verifiedVia,
    completedAt: serverTimestamp(),
  });

  // 2. Mettre à jour les points et le niveau de l'utilisateur
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const currentPoints = (userSnap.data().points as number) ?? 0;
    const newPoints = currentPoints + pointsEarned;
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
  return { alreadyDone: false, pointsEarned };
}

/** Déclaration libre — sur l'honneur, sans preuve. */
export async function markExperienceCompleted(
  userId: string,
  experienceId: string
): Promise<{ alreadyDone: boolean; pointsEarned: number }> {
  return completeExperienceInternal(userId, experienceId, false, 'declaration');
}

/**
 * Certification par code de passage affiché sur place par l'établissement.
 * Rejette si l'expérience n'est pas liée à un établissement, ou si le code
 * ne correspond pas à celui de l'établissement lié.
 */
const REPEAT_VISIT_POINTS = 20;

export async function markExperienceCompletedWithCode(
  userId: string,
  experienceId: string,
  enteredCode: string
): Promise<{ alreadyDone: boolean; pointsEarned: number; invalidCode?: boolean; isRepeatVisit?: boolean }> {
  const exp = await getExperienceById(experienceId);
  if (!exp?.linkedEstablishmentId) {
    return { alreadyDone: false, pointsEarned: 0, invalidCode: true };
  }
  const establishmentId = exp.linkedEstablishmentId;
  const estSnap = await getDoc(doc(db, 'establishments', establishmentId));
  const realCode = estSnap.exists() ? (estSnap.data().checkInCode as string) : '';
  if (!realCode || realCode.trim().toUpperCase() !== enteredCode.trim().toUpperCase()) {
    return { alreadyDone: false, pointsEarned: 0, invalidCode: true };
  }

  const completedRef = doc(db, 'completedExperiences', `${userId}_${experienceId}`);
  const completedSnap = await getDoc(completedRef);

  // Première certification de cette expérience : bonus plein + badge/passeport.
  if (!completedSnap.exists()) {
    await addDoc(collection(db, 'checkIns'), { userId, establishmentId, experienceId, createdAt: Date.now() });
    return completeExperienceInternal(userId, experienceId, true, 'code');
  }

  // Visite répétée : ne recrée pas l'enregistrement de complétion, mais alimente
  // les défis de fréquence et accorde un petit bonus pour encourager le retour.
  await addDoc(collection(db, 'checkIns'), { userId, establishmentId, experienceId, createdAt: Date.now() });
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const newPoints = ((userSnap.data().points as number) ?? 0) + REPEAT_VISIT_POINTS;
    const { level } = levelFromPoints(newPoints);
    await updateDoc(userRef, { points: newPoints, level });
  }
  return { alreadyDone: false, pointsEarned: REPEAT_VISIT_POINTS, isRepeatVisit: true };
}

/** Nombre de passages certifiés d'un utilisateur chez un établissement, sur une période optionnelle. */
export async function getCheckInCount(
  userId: string, establishmentId: string, sinceIso?: string, untilIso?: string
): Promise<number> {
  const q = query(
    collection(db, 'checkIns'),
    where('userId', '==', userId),
    where('establishmentId', '==', establishmentId)
  );
  const snap = await getDocs(q);
  let count = snap.docs.length;
  if (sinceIso || untilIso) {
    const since = sinceIso ? new Date(sinceIso).getTime() : 0;
    const until = untilIso ? new Date(untilIso).getTime() : Infinity;
    count = snap.docs.filter(d => {
      const t = d.data().createdAt as number;
      return t >= since && t <= until;
    }).length;
  }
  return count;
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
      type:         (data.type as Challenge['type']) ?? 'decouverte',
      targetEstablishmentId:   data.targetEstablishmentId as string | undefined,
      targetEstablishmentName: data.targetEstablishmentName as string | undefined,
      requiredVisits: data.requiredVisits as number | undefined,
      startDate:    data.startDate as string | undefined,
      endDate:      data.endDate as string | undefined,
      isActive:     (data.isActive as boolean) ?? true,
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

function isChallengeWindowOpen(challenge: Challenge): boolean {
  const now = Date.now();
  if (challenge.startDate && now < new Date(challenge.startDate).getTime()) return false;
  if (challenge.endDate && now > new Date(challenge.endDate).getTime() + 24 * 3600 * 1000 - 1) return false;
  return true;
}

/** Calcule si un défi est accompli, sans le récompenser (pour l'affichage de progression). */
export async function getChallengeProgress(
  userId: string, challenge: Challenge, completedIds: string[]
): Promise<{ done: number; total: number; isComplete: boolean; windowOpen: boolean }> {
  const windowOpen = isChallengeWindowOpen(challenge);

  if (challenge.type === 'frequence' && challenge.targetEstablishmentId) {
    const total = challenge.requiredVisits ?? 1;
    const done = await getCheckInCount(userId, challenge.targetEstablishmentId, challenge.startDate, challenge.endDate);
    return { done: Math.min(done, total), total, isComplete: done >= total, windowOpen };
  }

  const total = challenge.experiences.length;
  const done = challenge.experiences.filter((id) => completedIds.includes(id)).length;
  return { done, total, isComplete: done >= total && total > 0, windowOpen };
}

export async function checkAndRewardChallenge(
  userId: string,
  challenge: Challenge,
  completedIds: string[]
): Promise<boolean> {
  const progress = await getChallengeProgress(userId, challenge, completedIds);
  if (!progress.isComplete || !progress.windowOpen) return false;

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

  // Journal des réclamations — alimente le classement des défis communautaires.
  await addDoc(collection(db, 'challengeClaims'), {
    challengeId: challenge.id,
    userId,
    userName: (data.displayName as string) ?? 'Utilisateur',
    claimedAt: Date.now(),
  });

  return true;
}

/** Classement des N premiers à avoir réclamé un défi (pour les défis communautaires). */
export async function getChallengeLeaderboard(challengeId: string, max = 10): Promise<{ userName: string; claimedAt: number }[]> {
  const q = query(collection(db, 'challengeClaims'), where('challengeId', '==', challengeId));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ userName: d.data().userName as string, claimedAt: d.data().claimedAt as number }))
    .sort((a, b) => a.claimedAt - b.claimedAt)
    .slice(0, max);
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
