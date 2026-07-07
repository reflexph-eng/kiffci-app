/**
 * lib/pages-firestore.ts — Pages éditables & réglages footer (Sprint 1)
 */
import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { SitePage, FooterSettings } from '@/types';

// ── Pages ─────────────────────────────────────────────────────────────────────

function toPage(id: string, d: Record<string, unknown>): SitePage {
  return {
    id,
    slug:         (d.slug as string) ?? '',
    title:        (d.title as string) ?? '',
    content:      (d.content as string) ?? '',
    isPublished:  (d.isPublished as boolean) ?? false,
    showInFooter: (d.showInFooter as boolean) ?? false,
    order:        (d.order as number) ?? 0,
    createdAt:    (d.createdAt as number) ?? Date.now(),
    updatedAt:    (d.updatedAt as number) ?? Date.now(),
  };
}

export async function getPublishedPageBySlug(slug: string): Promise<SitePage | null> {
  const q = query(collection(db, 'pages'), where('slug', '==', slug), where('isPublished', '==', true));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return toPage(d.id, d.data());
}

export async function getFooterPages(): Promise<SitePage[]> {
  const q = query(collection(db, 'pages'),
    where('isPublished', '==', true), where('showInFooter', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(d => toPage(d.id, d.data())).sort((a, b) => a.order - b.order);
}

export async function getAllPagesAdmin(): Promise<SitePage[]> {
  const snap = await getDocs(query(collection(db, 'pages'), orderBy('order', 'asc')));
  return snap.docs.map(d => toPage(d.id, d.data()));
}

export async function createPage(data: Omit<SitePage, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'pages'), {
    ...data, createdAt: Date.now(), updatedAt: Date.now(),
  });
  return ref.id;
}

export async function updatePage(id: string, data: Partial<SitePage>): Promise<void> {
  await updateDoc(doc(db, 'pages', id), { ...data, updatedAt: Date.now() });
}

export async function deletePage(id: string): Promise<void> {
  await deleteDoc(doc(db, 'pages', id));
}

/** Pages par défaut (légales + à propos) — créées en un clic depuis l'admin. */
export const DEFAULT_PAGES: Omit<SitePage, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    slug: 'a-propos', title: 'À propos de KiffCI', isPublished: true, showInFooter: true, order: 1,
    content: `# KiffCI, la plateforme des expériences en Côte d'Ivoire

KiffCI aide chacun à découvrir, vivre et partager les meilleures expériences de loisirs en Côte d'Ivoire : sorties, nature, culture, détente, événements.

## Notre mission

Rendre les loisirs accessibles à tous, valoriser les établissements de qualité et contribuer à une meilleure qualité de vie.

## Nos valeurs

- **Découverte** : explorer la richesse du pays, région par région
- **Confiance** : des informations vérifiées et des partenaires sélectionnés
- **Indépendance** : KiffCI est une plateforme privée et indépendante`,
  },
  {
    slug: 'cgu', title: "Conditions générales d'utilisation", isPublished: true, showInFooter: true, order: 2,
    content: `# Conditions générales d'utilisation

*Dernière mise à jour : à compléter*

## 1. Objet

Les présentes conditions régissent l'utilisation de la plateforme KiffCI.

## 2. Données des partenaires

Les données individuelles des établissements partenaires ne sont **jamais transmises à des tiers**. KiffCI publie uniquement des statistiques agrégées et anonymisées.

## 3. Responsabilité

*À compléter avec votre conseil juridique.*`,
  },
  {
    slug: 'confidentialite', title: 'Politique de confidentialité', isPublished: true, showInFooter: true, order: 3,
    content: `# Politique de confidentialité

KiffCI respecte la loi n°2013-450 relative à la protection des données à caractère personnel en Côte d'Ivoire.

## Données collectées

Nous collectons uniquement les données nécessaires au fonctionnement du service : e-mail, nom d'affichage, préférences, favoris.

## Vos droits

Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Contact : *à compléter*.`,
  },
  {
    slug: 'mentions-legales', title: 'Mentions légales', isPublished: true, showInFooter: true, order: 4,
    content: `# Mentions légales

**Éditeur** : *à compléter (raison sociale, RCCM, siège)*

**Directeur de la publication** : *à compléter*

**Hébergement** : Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA

**Contact** : *à compléter*`,
  },
];

// ── Footer settings ───────────────────────────────────────────────────────────

export const DEFAULT_FOOTER: FooterSettings = {
  description: "La plateforme des expériences et loisirs en Côte d'Ivoire.",
  email: 'hello@kiffci.ci',
  phone: '',
  whatsapp: '',
  instagram: 'https://instagram.com/kiffci',
  tiktok: 'https://tiktok.com/@kiffci',
  facebook: '',
  youtube: '',
  updatedAt: 0,
};

export async function getFooterSettings(): Promise<FooterSettings> {
  const snap = await getDoc(doc(db, 'appSettings', 'footer'));
  if (!snap.exists()) return DEFAULT_FOOTER;
  return { ...DEFAULT_FOOTER, ...(snap.data() as Partial<FooterSettings>) };
}

export async function updateFooterSettings(data: Partial<FooterSettings>): Promise<void> {
  await setDoc(doc(db, 'appSettings', 'footer'),
    { ...data, updatedAt: Date.now() }, { merge: true });
}
