/**
 * lib/nav-firestore.ts — Menu de navigation éditable (Sprint 2)
 * Stocké comme un seul document (liste ordonnée) pour éviter des lectures multiples.
 */
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { NavItem } from '@/types';

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: 'experiences',    label: 'Expériences',    href: '/experiences',    isVisible: true, order: 1 },
  { id: 'establishments', label: 'Établissements', href: '/establishments', isVisible: true, order: 2 },
  { id: 'events',         label: 'Événements',     href: '/events',         isVisible: true, order: 3 },
  { id: 'map',            label: 'Carte',          href: '/map',            isVisible: true, order: 4 },
  { id: 'challenges',     label: 'Défis',          href: '/challenges',     isVisible: true, order: 5 },
];

export async function getNavItems(): Promise<NavItem[]> {
  const snap = await getDoc(doc(db, 'appSettings', 'navigation'));
  if (!snap.exists()) return DEFAULT_NAV_ITEMS;
  const items = (snap.data().items as NavItem[]) ?? DEFAULT_NAV_ITEMS;
  return items.sort((a, b) => a.order - b.order);
}

export async function saveNavItems(items: NavItem[]): Promise<void> {
  await setDoc(doc(db, 'appSettings', 'navigation'), { items, updatedAt: Date.now() });
}
