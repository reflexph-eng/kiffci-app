/**
 * lib/sections-firestore.ts — Rubriques dynamiques de la homepage (Sprint 2)
 */
import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, where,
} from 'firebase/firestore';
import { db } from './firebase';
import { HomeSection, Experience, Establishment, KiffEvent } from '@/types';
import { getExperiences } from './firestore';
import { getApprovedEstablishments, getApprovedEvents } from './partner-firestore';

function toSection(id: string, d: Record<string, unknown>): HomeSection {
  return {
    id,
    title:        (d.title as string) ?? '',
    subtitle:     (d.subtitle as string) ?? '',
    contentType:  (d.contentType as HomeSection['contentType']) ?? 'experiences',
    mode:         (d.mode as HomeSection['mode']) ?? 'manual',
    manualIds:    (d.manualIds as string[]) ?? [],
    autoCategory: (d.autoCategory as string) ?? '',
    autoMood:     (d.autoMood as string) ?? '',
    autoCity:     (d.autoCity as string) ?? '',
    autoPriceMax: (d.autoPriceMax as number) ?? 0,
    limit:        (d.limit as number) ?? 6,
    isActive:     (d.isActive as boolean) ?? true,
    order:        (d.order as number) ?? 0,
    createdAt:    (d.createdAt as number) ?? Date.now(),
    updatedAt:    (d.updatedAt as number) ?? Date.now(),
  };
}

export async function getAllSectionsAdmin(): Promise<HomeSection[]> {
  const snap = await getDocs(query(collection(db, 'sections'), orderBy('order', 'asc')));
  return snap.docs.map(d => toSection(d.id, d.data()));
}

export async function getActiveSections(): Promise<HomeSection[]> {
  const snap = await getDocs(query(collection(db, 'sections'), where('isActive', '==', true)));
  return snap.docs.map(d => toSection(d.id, d.data())).sort((a, b) => a.order - b.order);
}

export async function createSection(data: Omit<HomeSection, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'sections'), { ...data, createdAt: Date.now(), updatedAt: Date.now() });
  return ref.id;
}

export async function updateSection(id: string, data: Partial<HomeSection>): Promise<void> {
  await updateDoc(doc(db, 'sections', id), { ...data, updatedAt: Date.now() });
}

export async function deleteSection(id: string): Promise<void> {
  await deleteDoc(doc(db, 'sections', id));
}

// ── Résolution du contenu d'une rubrique (manuel ou auto) ────────────────────

type AnyItem = Experience | Establishment | KiffEvent;

function applyAutoFilters(section: HomeSection, items: AnyItem[]): AnyItem[] {
  return items.filter((it) => {
    if (section.autoCategory && 'category' in it && it.category !== section.autoCategory) return false;
    if (section.autoCity) {
      const city = 'city' in it ? it.city : undefined;
      if (city !== section.autoCity) return false;
    }
    if (section.autoMood && 'mood' in it) {
      if (!(it as Experience).mood.includes(section.autoMood)) return false;
    }
    if (section.autoPriceMax > 0 && 'priceMax' in it) {
      if ((it as Experience).priceMax > section.autoPriceMax) return false;
    }
    return true;
  });
}

export async function resolveSectionContent(section: HomeSection): Promise<AnyItem[]> {
  const pool: AnyItem[] =
    section.contentType === 'experiences'    ? await getExperiences() :
    section.contentType === 'establishments' ? await getApprovedEstablishments() :
    await getApprovedEvents();

  let result: AnyItem[];
  if (section.mode === 'manual') {
    const byId = new Map(pool.map(it => [it.id, it]));
    result = section.manualIds.map(id => byId.get(id)).filter(Boolean) as AnyItem[];
  } else {
    result = applyAutoFilters(section, pool);
  }
  return result.slice(0, section.limit || 6);
}
