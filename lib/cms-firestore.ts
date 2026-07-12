/**
 * lib/cms-firestore.ts
 * Toutes les fonctions CRUD pour le module CMS (appSettings, banners, categories, campaigns).
 */
import {
  doc, getDoc, setDoc, getDocs, addDoc, updateDoc, deleteDoc,
  collection, query, where, orderBy, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { HomepageSettings, Banner, Category, Campaign, CategoryProposal, Status } from '@/types';

function ts(v: unknown): number {
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === 'number')  return v;
  return Date.now();
}

// ── Default settings (utilisés si Firestore vide) ─────────────────────────────
export const DEFAULT_HOMEPAGE: HomepageSettings = {
  heroPromise:              "Les meilleures expériences à vivre en Côte d'Ivoire",
  heroTitle:                "Que veux-tu vivre aujourd'hui ?",
  heroSubtitle:             "Sorties, culture, nature, food, sport et nightlife en Côte d'Ivoire.",
  heroImageUrl:             'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  heroButtonText:           'Explorer',
  heroButtonLink:           '/experiences',
  slogan:                   'Vis. Explore. Kiffe.',
  featuredExperienceIds:    [],
  featuredEventIds:         [],
  featuredEstablishmentIds: [],
  activeCampaignId:         '',
  maintenanceMode:          false,
  appVersion:               '2.0.0',
  betaModeEnabled:          false,
  betaMessage:              'KiffCI est en version bêta — merci de nous signaler tout bug !',
  updatedAt:                Date.now(),
};

// ── Homepage Settings ─────────────────────────────────────────────────────────

export async function getHomepageSettings(): Promise<HomepageSettings> {
  const snap = await getDoc(doc(db, 'appSettings', 'homepage'));
  if (!snap.exists()) return DEFAULT_HOMEPAGE;
  const d = snap.data();
  return {
    heroPromise:              d.heroPromise              ?? DEFAULT_HOMEPAGE.heroPromise,
    heroTitle:                d.heroTitle                ?? DEFAULT_HOMEPAGE.heroTitle,
    heroSubtitle:             d.heroSubtitle             ?? DEFAULT_HOMEPAGE.heroSubtitle,
    heroImageUrl:             d.heroImageUrl             ?? DEFAULT_HOMEPAGE.heroImageUrl,
    heroButtonText:           d.heroButtonText           ?? DEFAULT_HOMEPAGE.heroButtonText,
    heroButtonLink:           d.heroButtonLink           ?? DEFAULT_HOMEPAGE.heroButtonLink,
    slogan:                   d.slogan                   ?? DEFAULT_HOMEPAGE.slogan,
    featuredExperienceIds:    d.featuredExperienceIds    ?? [],
    featuredEventIds:         d.featuredEventIds         ?? [],
    featuredEstablishmentIds: d.featuredEstablishmentIds ?? [],
    activeCampaignId:         d.activeCampaignId         ?? '',
    maintenanceMode:          d.maintenanceMode          ?? false,
    appVersion:               d.appVersion               ?? '2.0.0',
    betaModeEnabled:          d.betaModeEnabled          ?? false,
    betaMessage:              d.betaMessage              ?? 'KiffCI est en version bêta — merci de nous signaler tout bug !',
    updatedAt:                ts(d.updatedAt),
  };
}

export async function saveHomepageSettings(
  data: Omit<HomepageSettings, 'updatedAt'>
): Promise<void> {
  await setDoc(doc(db, 'appSettings', 'homepage'), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ── Banners ───────────────────────────────────────────────────────────────────

function toBanner(id: string, d: Record<string, unknown>): Banner {
  return {
    id,
    title:      (d.title      as string)  ?? '',
    subtitle:   (d.subtitle   as string)  ?? '',
    imageUrl:   (d.imageUrl   as string)  ?? '',
    buttonText: (d.buttonText as string)  ?? '',
    buttonLink:      (d.buttonLink      as string) ?? '',
    textColor:       (d.textColor       as string) ?? '#FFFFFF',
    buttonBgColor:   (d.buttonBgColor   as string) ?? '#E89A16',
    buttonTextColor: (d.buttonTextColor as string) ?? '#FFFFFF',
    position:   (d.position   as number)  ?? 0,
    isActive:   (d.isActive   as boolean) ?? true,
    startDate:  (d.startDate  as string)  ?? '',
    endDate:    (d.endDate    as string)  ?? '',
    createdAt:  ts(d.createdAt),
  };
}

export async function getBanners(): Promise<Banner[]> {
  const snap = await getDocs(
    query(collection(db, 'banners'), orderBy('position', 'asc'))
  );
  return snap.docs.map(d => toBanner(d.id, d.data() as Record<string, unknown>));
}

export async function getActiveBanners(): Promise<Banner[]> {
  const q = query(
    collection(db, 'banners'),
    where('isActive', '==', true),
    orderBy('position', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => toBanner(d.id, d.data() as Record<string, unknown>));
}

export async function createBanner(data: Omit<Banner, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'banners'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateBanner(id: string, data: Partial<Omit<Banner, 'id' | 'createdAt'>>): Promise<void> {
  await updateDoc(doc(db, 'banners', id), data);
}

export async function deleteBanner(id: string): Promise<void> {
  await deleteDoc(doc(db, 'banners', id));
}

export async function toggleBanner(id: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(db, 'banners', id), { isActive });
}

// ── Categories ────────────────────────────────────────────────────────────────

function toCategory(id: string, d: Record<string, unknown>): Category {
  return {
    id,
    name:      (d.name      as string)  ?? '',
    icon:      (d.icon      as string)  ?? '📍',
    color:     (d.color     as string)  ?? '#F97316',
    type:      (d.type      as string)  ?? 'experience',
    isVisible: (d.isVisible as boolean) ?? true,
    order:     (d.order     as number)  ?? 0,
    createdAt: ts(d.createdAt),
  };
}

export async function getCategories(): Promise<Category[]> {
  const snap = await getDocs(
    query(collection(db, 'categories'), orderBy('order', 'asc'))
  );
  return snap.docs.map(d => toCategory(d.id, d.data() as Record<string, unknown>));
}

export async function getVisibleCategories(): Promise<Category[]> {
  const q = query(
    collection(db, 'categories'),
    where('isVisible', '==', true),
    orderBy('order', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => toCategory(d.id, d.data() as Record<string, unknown>));
}

export async function createCategory(data: Omit<Category, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'categories'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCategory(id: string, data: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<void> {
  await updateDoc(doc(db, 'categories', id), data);
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, 'categories', id));
}

export async function toggleCategory(id: string, isVisible: boolean): Promise<void> {
  await updateDoc(doc(db, 'categories', id), { isVisible });
}

// ── Campaigns ─────────────────────────────────────────────────────────────────

function toCampaign(id: string, d: Record<string, unknown>): Campaign {
  return {
    id,
    title:                   (d.title                   as string)   ?? '',
    description:             (d.description             as string)   ?? '',
    imageUrl:                (d.imageUrl                as string)   ?? '',
    startDate:               (d.startDate               as string)   ?? '',
    endDate:                 (d.endDate                 as string)   ?? '',
    isActive:                (d.isActive                as boolean)  ?? false,
    targetType:              (d.targetType              as Campaign['targetType']) ?? 'mixed',
    linkedExperienceIds:     (d.linkedExperienceIds     as string[]) ?? [],
    linkedEventIds:          (d.linkedEventIds          as string[]) ?? [],
    linkedEstablishmentIds:  (d.linkedEstablishmentIds  as string[]) ?? [],
    createdAt:               ts(d.createdAt),
  };
}

export async function getCampaigns(): Promise<Campaign[]> {
  const snap = await getDocs(
    query(collection(db, 'campaigns'), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map(d => toCampaign(d.id, d.data() as Record<string, unknown>));
}

export async function getActiveCampaigns(): Promise<Campaign[]> {
  const q = query(
    collection(db, 'campaigns'),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => toCampaign(d.id, d.data() as Record<string, unknown>));
}

export async function createCampaign(data: Omit<Campaign, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'campaigns'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCampaign(id: string, data: Partial<Omit<Campaign, 'id' | 'createdAt'>>): Promise<void> {
  await updateDoc(doc(db, 'campaigns', id), data);
}

export async function deleteCampaign(id: string): Promise<void> {
  await deleteDoc(doc(db, 'campaigns', id));
}

export async function toggleCampaign(id: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(db, 'campaigns', id), { isActive });
}

// ── Seed CMS demo data ────────────────────────────────────────────────────────

export async function seedCmsData(): Promise<void> {
  // Homepage settings
  await setDoc(doc(db, 'appSettings', 'homepage'), {
    ...DEFAULT_HOMEPAGE,
    updatedAt: serverTimestamp(),
  });

  // Banners
  const bannersData = [
    {
      title:      'Découvre Abidjan autrement',
      subtitle:   'Les meilleures expériences locales sélectionnées pour toi',
      imageUrl:   'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      buttonText: 'Explorer',
      buttonLink: '/experiences',
      position:   1,
      isActive:   true,
      startDate:  '2025-01-01',
      endDate:    '2025-12-31',
    },
    {
      title:      'Partenaires — Rejoins Kiffci',
      subtitle:   'Publie ton établissement gratuitement et touche des milliers d\'utilisateurs',
      imageUrl:   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
      buttonText: 'Devenir partenaire',
      buttonLink: '/partner/create-establishment',
      position:   2,
      isActive:   true,
      startDate:  '2025-01-01',
      endDate:    '2025-12-31',
    },
  ];

  for (const b of bannersData) {
    await addDoc(collection(db, 'banners'), { ...b, createdAt: serverTimestamp() });
  }

  // Categories
  const categoriesData = [
    { name: 'Nature',      icon: '🌿', color: '#10B981', type: 'experience', isVisible: true,  order: 1 },
    { name: 'Culture',     icon: '🎭', color: '#8B5CF6', type: 'experience', isVisible: true,  order: 2 },
    { name: 'Food',        icon: '🍜', color: '#F97316', type: 'experience', isVisible: true,  order: 3 },
    { name: 'Nightlife',   icon: '🌙', color: '#1F2937', type: 'experience', isVisible: true,  order: 4 },
    { name: 'Sport',       icon: '⚡', color: '#EF4444', type: 'experience', isVisible: true,  order: 5 },
    { name: 'Bien-être',   icon: '💆', color: '#06B6D4', type: 'experience', isVisible: true,  order: 6 },
    { name: 'Découverte',  icon: '🧭', color: '#F59E0B', type: 'experience', isVisible: true,  order: 7 },
    { name: 'Créatif',     icon: '🎨', color: '#EC4899', type: 'experience', isVisible: false, order: 8 },
  ];

  for (const c of categoriesData) {
    await addDoc(collection(db, 'categories'), { ...c, createdAt: serverTimestamp() });
  }

  // Campaigns
  const campaignsData = [
    {
      title:                  'Été à Abidjan 2025',
      description:            'Profite de l\'été avec nos meilleures sélections nature et plages.',
      imageUrl:               'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80',
      startDate:              '2025-06-01',
      endDate:                '2025-09-30',
      isActive:               true,
      targetType:             'experience' as const,
      linkedExperienceIds:    [],
      linkedEventIds:         [],
      linkedEstablishmentIds: [],
    },
  ];

  for (const c of campaignsData) {
    await addDoc(collection(db, 'campaigns'), { ...c, createdAt: serverTimestamp() });
  }
}

// ── Propositions de catégories (Sprint 8) ───────────────────────────────────
export async function proposeCategory(name: string, proposedBy: string, proposedByName?: string): Promise<string> {
  const ref = await addDoc(collection(db, 'categoryProposals'), {
    name: name.trim(), proposedBy, proposedByName: proposedByName ?? '', status: 'pending', createdAt: serverTimestamp(),
  });
  return ref.id;
}


export async function getCategoryProposals(status?: Status): Promise<CategoryProposal[]> {
  const base = collection(db, 'categoryProposals');
  const q = status ? query(base, where('status', '==', status)) : query(base);
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    const created = data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : (data.createdAt ?? Date.now());
    const reviewed = data.reviewedAt instanceof Timestamp ? data.reviewedAt.toMillis() : data.reviewedAt;
    return { id: d.id, ...data, createdAt: created, reviewedAt: reviewed } as CategoryProposal;
  }).sort((a,b) => b.createdAt - a.createdAt);
}

export async function reviewCategoryProposal(
  proposal: CategoryProposal,
  status: 'approved' | 'rejected',
  categoryOrder: number
): Promise<void> {
  if (status === 'approved') {
    await addDoc(collection(db, 'categories'), {
      name: proposal.name.trim(), icon: '✨', color: '#F97316', type: 'experience',
      isVisible: true, order: categoryOrder, createdAt: serverTimestamp(),
    });
  }
  await updateDoc(doc(db, 'categoryProposals', proposal.id), { status, reviewedAt: serverTimestamp() });
}
