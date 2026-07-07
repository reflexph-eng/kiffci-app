/**
 * lib/ads-firestore.ts — Encarts publicitaires par emplacement (Sprint 2)
 */
import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { AdCreative, AdSlotId } from '@/types';

export const AD_SLOTS: { id: AdSlotId; label: string; hint: string }[] = [
  { id: 'home-hero-bas',      label: 'Accueil — sous le hero',            hint: 'Format large (bandeau)' },
  { id: 'home-milieu',        label: 'Accueil — milieu de page',          hint: 'Format panoramique' },
  { id: 'liste-experiences',  label: 'Liste des expériences (insertion)', hint: 'Format carte, discret' },
  { id: 'detail-sidebar',     label: 'Fiche détail — encart latéral',     hint: 'Vertical' },
  { id: 'carte-bas',          label: 'Page carte — sous la carte',        hint: 'Format bandeau' },
];

function toAd(id: string, d: Record<string, unknown>): AdCreative {
  return {
    id,
    slotId:      (d.slotId as AdSlotId) ?? 'home-hero-bas',
    title:       (d.title as string) ?? '',
    imageUrl:    (d.imageUrl as string) ?? '',
    linkUrl:     (d.linkUrl as string) ?? '',
    sponsorName: (d.sponsorName as string) ?? '',
    startDate:   (d.startDate as string) ?? '',
    endDate:     (d.endDate as string) ?? '',
    isActive:    (d.isActive as boolean) ?? false,
    views:       (d.views as number) ?? 0,
    clicks:      (d.clicks as number) ?? 0,
    createdAt:   (d.createdAt as number) ?? Date.now(),
    updatedAt:   (d.updatedAt as number) ?? Date.now(),
  };
}

export async function getAllAdsAdmin(): Promise<AdCreative[]> {
  const snap = await getDocs(collection(db, 'ads'));
  return snap.docs.map(d => toAd(d.id, d.data())).sort((a, b) => b.createdAt - a.createdAt);
}

/** Retourne l'encart actif à afficher pour un emplacement donné (le plus récent si plusieurs), ou null. */
export async function getActiveAdForSlot(slotId: AdSlotId): Promise<AdCreative | null> {
  const snap = await getDocs(query(collection(db, 'ads'), where('slotId', '==', slotId), where('isActive', '==', true)));
  if (snap.empty) return null;
  const today = new Date().toISOString().slice(0, 10);
  const candidates = snap.docs
    .map(d => toAd(d.id, d.data()))
    .filter(ad => (!ad.startDate || ad.startDate <= today) && (!ad.endDate || ad.endDate >= today));
  if (candidates.length === 0) return null;
  return candidates.sort((a, b) => b.updatedAt - a.updatedAt)[0];
}

export async function createAd(data: Omit<AdCreative, 'id' | 'views' | 'clicks' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'ads'), {
    ...data, views: 0, clicks: 0, createdAt: Date.now(), updatedAt: Date.now(),
  });
  return ref.id;
}

export async function updateAd(id: string, data: Partial<AdCreative>): Promise<void> {
  await updateDoc(doc(db, 'ads', id), { ...data, updatedAt: Date.now() });
}

export async function deleteAd(id: string): Promise<void> {
  await deleteDoc(doc(db, 'ads', id));
}

export async function trackAdView(id: string): Promise<void> {
  await updateDoc(doc(db, 'ads', id), { views: increment(1) });
}

export async function trackAdClick(id: string): Promise<void> {
  await updateDoc(doc(db, 'ads', id), { clicks: increment(1) });
}
