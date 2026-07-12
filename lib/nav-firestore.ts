/**
 * lib/nav-firestore.ts — Menu de navigation éditable (Sprint 2, étendu Sprint 11)
 * Stocké comme un seul document (liste ordonnée) pour éviter des lectures multiples.
 */
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { NavItem } from '@/types';

/**
 * Tous les éléments réels du site, y compris ceux qui étaient jusque-là codés
 * en dur (Passeport, Favoris, Profil, Espace Annonceur, Administration,
 * Modération, Récompenses). Le `scope` ne fait qu'aider à l'affichage dans
 * l'admin — la visibilité réelle selon le rôle/la connexion reste toujours
 * appliquée par le code (voir components/Nav.tsx), jamais uniquement par
 * cette configuration.
 */
export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: 'experiences',    label: 'Expériences',      href: '/experiences',       isVisible: true, order: 1,  placement: 'bar',  scope: 'public' },
  { id: 'establishments', label: 'Créateurs',   href: '/establishments',    isVisible: true, order: 2,  placement: 'bar',  scope: 'public' },
  { id: 'events',         label: 'Événements',       href: '/events',            isVisible: true, order: 3,  placement: 'bar',  scope: 'public' },
  { id: 'map',            label: 'Carte',            href: '/map',               isVisible: true, order: 4,  placement: 'bar',  scope: 'public' },
  { id: 'challenges',     label: 'Défis',            href: '/challenges',        isVisible: true, order: 5,  placement: 'more', scope: 'public' },
  { id: 'recompenses',    label: 'Récompenses',      href: '/recompenses',       isVisible: true, order: 6,  placement: 'more', scope: 'public' },
  { id: 'passport',       label: 'Passeport',        href: '/passport',          isVisible: true, order: 7,  placement: 'more', scope: 'auth' },
  { id: 'favorites',      label: 'Favoris',          href: '/favorites',         isVisible: true, order: 8,  placement: 'more', scope: 'auth' },
  { id: 'profile',        label: 'Profil',           href: '/profile',           isVisible: true, order: 9,  placement: 'more', scope: 'auth' },
  { id: 'partner',        label: 'Espace Annonceur', href: '/partner/dashboard', isVisible: true, order: 10, placement: 'more', scope: 'partner' },
  { id: 'admin',          label: 'Administration',   href: '/admin',             isVisible: true, order: 11, placement: 'more', scope: 'admin' },
  { id: 'moderation',     label: 'Modération',       href: '/admin/moderation',  isVisible: true, order: 12, placement: 'more', scope: 'moderator' },
];

/**
 * Complète un item éventuellement stocké avant cette mise à jour (donc sans
 * `placement`/`scope`) avec les valeurs par défaut correspondantes — pour ne
 * jamais faire planter ou vider un menu déjà configuré par l'admin.
 */
function withDefaults(stored: Partial<NavItem> & { id: string }): NavItem {
  const fallback = DEFAULT_NAV_ITEMS.find(d => d.id === stored.id);
  return {
    id: stored.id,
    label: stored.label ?? fallback?.label ?? stored.id,
    href: stored.href ?? fallback?.href ?? '/',
    isVisible: stored.isVisible ?? fallback?.isVisible ?? true,
    order: stored.order ?? fallback?.order ?? 99,
    placement: stored.placement ?? fallback?.placement ?? 'more',
    scope: stored.scope ?? fallback?.scope ?? 'public',
  };
}

export async function getNavItems(): Promise<NavItem[]> {
  const snap = await getDoc(doc(db, 'appSettings', 'navigation'));
  if (!snap.exists()) return DEFAULT_NAV_ITEMS;

  const stored = (snap.data().items as (Partial<NavItem> & { id: string })[]) ?? [];
  const storedIds = new Set(stored.map(i => i.id));

  // 1. Les éléments déjà enregistrés, complétés si besoin.
  const merged = stored.map(withDefaults);
  // 2. Les nouveaux éléments (ex: Récompenses, Espace Annonceur…) absents de
  //    l'enregistrement précédent — ajoutés à la fin, sans écraser le reste.
  const additions = DEFAULT_NAV_ITEMS.filter(d => !storedIds.has(d.id));

  return [...merged, ...additions].sort((a, b) => a.order - b.order);
}

export async function saveNavItems(items: NavItem[]): Promise<void> {
  await setDoc(doc(db, 'appSettings', 'navigation'), { items, updatedAt: Date.now() });
}
