/**
 * lib/partner-firestore.ts
 * Toutes les fonctions CRUD pour Establishments et Events (module Partenaires).
 */
import {
  collection, doc, getDoc, getDocs, addDoc, setDoc,
  updateDoc, deleteDoc, deleteField, query, where, orderBy,
  serverTimestamp, Timestamp, increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { Establishment, KiffEvent, PartnerStats, Status, Experience } from '@/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function ts(v: unknown): number {
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === 'number') return v;
  return Date.now();
}


/** Génère un code de passage lisible (6 caractères, sans caractères ambigus). */
function generateCheckInCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans I, O, 0, 1
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function toEst(id: string, d: Record<string, unknown>): Establishment {
  return {
    id,
    name:           (d.name           as string)   ?? '',
    description:    (d.description    as string)   ?? '',
    category:       (d.category       as string)   ?? '',
    city:           (d.city           as string)   ?? '',
    district:       (d.district       as string)   ?? '',
    address:        (d.address        as string)   ?? '',
    latitude:       (d.latitude       as number)   ?? 0,
    longitude:      (d.longitude      as number)   ?? 0,
    phone:          (d.phone          as string)   ?? '',
    whatsapp:       (d.whatsapp       as string)   ?? '',
    email:          (d.email          as string)   ?? '',
    website:        d.website         as string | undefined,
    images:         (d.images         as string[]) ?? [],
    ownerId:        (d.ownerId        as string)   ?? '',
    ownerName:      d.ownerName       as string | undefined,
    status:         (d.status         as Status)   ?? 'pending',
    isFeatured:     (d.isFeatured     as boolean)  ?? false,
    isSponsored:    (d.isSponsored    as boolean)  ?? false,
    isVerified:     (d.isVerified     as boolean)  ?? false,
    highlightType:   d.highlightType as Establishment['highlightType'],
    highlightStatus: d.highlightStatus as Establishment['highlightStatus'],
    highlightBadge:  d.highlightBadge as Establishment['highlightBadge'],
    highlightSections: (d.highlightSections as Establishment['highlightSections']) ?? [],
    highlightStartAt: d.highlightStartAt as number | undefined,
    highlightEndAt:   d.highlightEndAt as number | undefined,
    highlightRank:    d.highlightRank as number | undefined,
    highlightPaymentRef: d.highlightPaymentRef as string | undefined,
    highlightAmount:  d.highlightAmount as number | undefined,
    highlightCurrency: d.highlightCurrency as Establishment['highlightCurrency'],
    // checkInCode volontairement absent ici : il n'est plus stocké sur ce
    // document (lisible publiquement). Voir getEstablishmentCode().
    earlyAccessUntil: d.earlyAccessUntil as number | undefined,
    avgRating:      d.avgRating as number | undefined,
    reviewCount:    d.reviewCount as number | undefined,
    premiumUntil:   d.premiumUntil    as number | undefined,
    views:          (d.views          as number)   ?? 0,
    favoritesCount: (d.favoritesCount as number)   ?? 0,
    whatsappClicks: (d.whatsappClicks as number)   ?? 0,
    phoneClicks:    (d.phoneClicks    as number)   ?? 0,
    moderationNote: d.moderationNote as string | undefined,
    createdAt:      ts(d.createdAt),
    updatedAt:      ts(d.updatedAt),
  };
}

function toEvt(id: string, d: Record<string, unknown>): KiffEvent {
  return {
    id,
    title:          (d.title          as string)   ?? '',
    description:    (d.description    as string)   ?? '',
    startDate:      (d.startDate      as string)   ?? '',
    endDate:        (d.endDate        as string)   ?? '',
    city:           (d.city           as string)   ?? '',
    location:       (d.location       as string)   ?? '',
    price:          (d.price          as string)   ?? '',
    capacity:       d.capacity        as number | undefined,
    images:         (d.images         as string[]) ?? [],
    organizerId:    (d.organizerId    as string)   ?? '',
    organizerName:  d.organizerName   as string | undefined,
    establishmentId:d.establishmentId as string | undefined,
    contactPhone:   (d.contactPhone   as string)   ?? '',
    whatsapp:       (d.whatsapp       as string)   ?? '',
    status:         (d.status         as Status)   ?? 'pending',
    isFeatured:     (d.isFeatured     as boolean)  ?? false,
    isSponsored:    (d.isSponsored    as boolean)  ?? false,
    highlightType:   d.highlightType as KiffEvent['highlightType'],
    highlightStatus: d.highlightStatus as KiffEvent['highlightStatus'],
    highlightBadge:  d.highlightBadge as KiffEvent['highlightBadge'],
    highlightSections: (d.highlightSections as KiffEvent['highlightSections']) ?? [],
    highlightStartAt: d.highlightStartAt as number | undefined,
    highlightEndAt:   d.highlightEndAt as number | undefined,
    highlightRank:    d.highlightRank as number | undefined,
    highlightPaymentRef: d.highlightPaymentRef as string | undefined,
    highlightAmount:  d.highlightAmount as number | undefined,
    highlightCurrency: d.highlightCurrency as KiffEvent['highlightCurrency'],
    premiumUntil:   d.premiumUntil    as number | undefined,
    views:          (d.views          as number)   ?? 0,
    favoritesCount: (d.favoritesCount as number)   ?? 0,
    whatsappClicks: (d.whatsappClicks as number)   ?? 0,
    phoneClicks:    (d.phoneClicks    as number)   ?? 0,
    moderationNote: d.moderationNote as string | undefined,
    earlyAccessUntil: d.earlyAccessUntil as number | undefined,
    avgRating:      d.avgRating as number | undefined,
    reviewCount:    d.reviewCount as number | undefined,
    createdAt:      ts(d.createdAt),
    updatedAt:      ts(d.updatedAt),
  };
}

// ── Establishments — PUBLIC ───────────────────────────────────────────────────

export async function getApprovedEstablishments(): Promise<Establishment[]> {
  const q = query(
    collection(db, 'establishments'),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => toEst(d.id, d.data() as Record<string, unknown>));
}

export async function getEstablishmentById(id: string): Promise<Establishment | null> {
  const snap = await getDoc(doc(db, 'establishments', id));
  if (!snap.exists()) return null;
  return toEst(snap.id, snap.data() as Record<string, unknown>);
}

// ── Establishments — PARTNER ──────────────────────────────────────────────────

export async function getMyEstablishments(ownerId: string): Promise<Establishment[]> {
  const q = query(
    collection(db, 'establishments'),
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => toEst(d.id, d.data() as Record<string, unknown>));
}

export async function createEstablishment(
  data: Omit<Establishment, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'favoritesCount' | 'whatsappClicks' | 'phoneClicks' | 'checkInCode'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'establishments'), {
    ...data,
    status:         'pending',
    isFeatured:     false,
    isSponsored:    false,
    isVerified:     false,
    views:          0,
    favoritesCount: 0,
    whatsappClicks: 0,
    phoneClicks:    0,
    createdAt:      serverTimestamp(),
    updatedAt:      serverTimestamp(),
  });
  // Le code de passage vit dans une collection à part, non lisible publiquement.
  await setDoc(doc(db, 'establishmentCodes', ref.id), { code: generateCheckInCode() });
  return ref.id;
}

export async function updateEstablishment(
  id: string,
  data: Partial<Omit<Establishment, 'id' | 'createdAt' | 'ownerId'>>
): Promise<void> {
  await updateDoc(doc(db, 'establishments', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEstablishment(id: string): Promise<void> {
  await deleteDoc(doc(db, 'establishments', id));
}

// ── Establishments — ADMIN ────────────────────────────────────────────────────

export async function getAllEstablishmentsAdmin(): Promise<Establishment[]> {
  const snap = await getDocs(
    query(collection(db, 'establishments'), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map(d => toEst(d.id, d.data() as Record<string, unknown>));
}

export async function getPendingEstablishments(): Promise<Establishment[]> {
  const q = query(
    collection(db, 'establishments'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => toEst(d.id, d.data() as Record<string, unknown>));
}

export async function moderateEstablishment(id: string, status: 'approved' | 'rejected'): Promise<void> {
  await updateDoc(doc(db, 'establishments', id), { status, updatedAt: serverTimestamp() });
}

/**
 * Lit le code de passage d'un établissement. Réservé au propriétaire et à
 * l'admin (imposé par les règles Firestore sur `establishmentCodes`). Renvoie
 * une chaîne vide si aucun code n'existe encore.
 */
export async function getEstablishmentCode(establishmentId: string): Promise<string> {
  const snap = await getDoc(doc(db, 'establishmentCodes', establishmentId)).catch(() => null);
  return snap?.exists() ? ((snap.data().code as string) ?? '') : '';
}

/**
 * Migration one-shot (admin) : déplace les anciens codes stockés sur le
 * document établissement (schéma pré-sécurité) vers la collection restreinte
 * `establishmentCodes`, puis purge le champ du document public. Idempotente :
 * n'agit que sur les fiches qui ont encore un `checkInCode` legacy.
 * Retourne le nombre de codes migrés.
 */
export async function migrateLegacyCheckInCodes(): Promise<number> {
  const snap = await getDocs(collection(db, 'establishments'));
  let migrated = 0;
  for (const d of snap.docs) {
    const legacy = d.data().checkInCode as string | undefined;
    if (!legacy) continue;
    await setDoc(doc(db, 'establishmentCodes', d.id), { code: legacy }, { merge: true });
    await updateDoc(doc(db, 'establishments', d.id), { checkInCode: deleteField() });
    migrated++;
  }
  return migrated;
}

/** Régénère le code de passage d'un établissement (partenaire propriétaire ou admin). */
export async function regenerateCheckInCode(establishmentId: string): Promise<string> {
  const code = generateCheckInCode();
  await setDoc(doc(db, 'establishmentCodes', establishmentId), { code }, { merge: true });
  return code;
}

/**
 * Migration (admin) : convertit chaque Expérience créée directement depuis
 * l'admin (donc sans établissement partenaire associé) en un vrai
 * Établissement — approuvé d'office, propriété de l'admin qui migre — puis
 * relie l'Expérience d'origine au nouvel établissement via
 * `linkedEstablishmentId`. Non destructif : l'Expérience existante n'est ni
 * supprimée ni modifiée à part ce lien, elle continue de fonctionner
 * normalement (favoris, avis, expériences complétées restent intacts).
 * Idempotente : ignore les expériences déjà liées à un établissement.
 * Retourne le nombre d'établissements créés.
 */
export type MigrationError = { experienceId: string; title: string; step: string; message: string };
export type MigrationResult = { migrated: number; skipped: number; errors: MigrationError[] };

export async function migrateExperiencesToEstablishments(
  actorId: string, actorName: string
): Promise<MigrationResult> {
  const snap = await getDocs(collection(db, 'experiences'));
  let migrated = 0;
  let skipped = 0;
  const errors: MigrationError[] = [];

  for (const d of snap.docs) {
    const data = d.data() as Record<string, unknown>;
    if (data.linkedEstablishmentId) { skipped++; continue; }

    const exp = { id: d.id, ...data } as Experience;
    const title = exp.title || d.id;
    let step = 'création';

    try {
      step = 'création de l\'établissement (pending)';
      const estRef = await addDoc(collection(db, 'establishments'), {
        name: exp.title ?? '(sans titre)',
        description: exp.description ?? '',
        category: exp.category ?? '',
        city: exp.city ?? '',
        district: exp.district ?? '',
        address: exp.district || exp.city || '',
        latitude: exp.latitude ?? 0,
        longitude: exp.longitude ?? 0,
        phone: exp.contactPhone ?? '',
        whatsapp: exp.whatsapp ?? '',
        email: exp.email ?? '',
        images: exp.images ?? [],
        ownerId: actorId,
        ownerName: actorName ?? '',
        status: 'pending',
        isFeatured: false,
        isSponsored: false,
        isVerified: false,
        views: 0,
        favoritesCount: 0,
        whatsappClicks: 0,
        phoneClicks: 0,
        createdAt: exp.createdAt ?? Date.now(),
        updatedAt: Date.now(),
      });

      step = 'approbation de l\'établissement';
      await updateDoc(doc(db, 'establishments', estRef.id), {
        status: 'approved',
        isFeatured: exp.isPremium ?? false,
        isSponsored: exp.isSponsored ?? false,
        earlyAccessUntil: exp.earlyAccessUntil ?? null,
        avgRating: exp.avgRating ?? null,
        reviewCount: exp.reviewCount ?? null,
        highlightType: exp.highlightType ?? null,
        highlightStatus: exp.highlightStatus ?? null,
        highlightBadge: exp.highlightBadge ?? null,
        highlightSections: exp.highlightSections ?? [],
        highlightStartAt: exp.highlightStartAt ?? null,
        highlightEndAt: exp.highlightEndAt ?? null,
        highlightRank: exp.highlightRank ?? null,
        updatedAt: Date.now(),
      });

      step = 'création du code de passage';
      await setDoc(doc(db, 'establishmentCodes', estRef.id), { code: generateCheckInCode() });

      step = 'liaison de l\'expérience d\'origine';
      await updateDoc(doc(db, 'experiences', d.id), { linkedEstablishmentId: estRef.id });

      migrated++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[Migration] Échec sur "${title}" (${d.id}) à l'étape « ${step} » :`, err);
      errors.push({ experienceId: d.id, title, step, message });
    }
  }

  return { migrated, skipped, errors };
}

// ── Stats tracking ────────────────────────────────────────────────────────────

export async function trackEstablishmentView(id: string): Promise<void> {
  await updateDoc(doc(db, 'establishments', id), { views: increment(1) });
}
export async function trackWhatsappClick(id: string, type: 'establishment' | 'event'): Promise<void> {
  const col = type === 'establishment' ? 'establishments' : 'events';
  await updateDoc(doc(db, col, id), { whatsappClicks: increment(1) });
}
export async function trackPhoneClick(id: string, type: 'establishment' | 'event'): Promise<void> {
  const col = type === 'establishment' ? 'establishments' : 'events';
  await updateDoc(doc(db, col, id), { phoneClicks: increment(1) });
}

// ── Events — PUBLIC ───────────────────────────────────────────────────────────

export async function getApprovedEvents(): Promise<KiffEvent[]> {
  const q = query(
    collection(db, 'events'),
    where('status', '==', 'approved'),
    orderBy('startDate', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => toEvt(d.id, d.data() as Record<string, unknown>));
}

export async function getEventById(id: string): Promise<KiffEvent | null> {
  const snap = await getDoc(doc(db, 'events', id));
  if (!snap.exists()) return null;
  return toEvt(snap.id, snap.data() as Record<string, unknown>);
}

// ── Events — PARTNER ──────────────────────────────────────────────────────────

export async function getMyEvents(organizerId: string): Promise<KiffEvent[]> {
  const q = query(
    collection(db, 'events'),
    where('organizerId', '==', organizerId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => toEvt(d.id, d.data() as Record<string, unknown>));
}

export async function createEvent(
  data: Omit<KiffEvent, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'favoritesCount' | 'whatsappClicks' | 'phoneClicks'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'events'), {
    ...data,
    status:         'pending',
    isFeatured:     false,
    isSponsored:    false,
    views:          0,
    favoritesCount: 0,
    whatsappClicks: 0,
    phoneClicks:    0,
    createdAt:      serverTimestamp(),
    updatedAt:      serverTimestamp(),
  });
  return ref.id;
}

export async function updateEvent(
  id: string,
  data: Partial<Omit<KiffEvent, 'id' | 'createdAt' | 'organizerId'>>
): Promise<void> {
  await updateDoc(doc(db, 'events', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(db, 'events', id));
}

// ── Events — ADMIN ────────────────────────────────────────────────────────────

export async function getPendingEvents(): Promise<KiffEvent[]> {
  const q = query(
    collection(db, 'events'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => toEvt(d.id, d.data() as Record<string, unknown>));
}

export async function getAllEventsAdmin(): Promise<KiffEvent[]> {
  const snap = await getDocs(
    query(collection(db, 'events'), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map(d => toEvt(d.id, d.data() as Record<string, unknown>));
}

export async function moderateEvent(id: string, status: 'approved' | 'rejected'): Promise<void> {
  await updateDoc(doc(db, 'events', id), { status, updatedAt: serverTimestamp() });
}

// ── Partner stats ─────────────────────────────────────────────────────────────

export async function getPartnerStats(ownerId: string): Promise<PartnerStats> {
  const [ests, evts] = await Promise.all([
    getMyEstablishments(ownerId),
    getMyEvents(ownerId),
  ]);
  return {
    totalEstablishments:   ests.length,
    approvedEstablishments:ests.filter(e => e.status === 'approved').length,
    pendingEstablishments: ests.filter(e => e.status === 'pending').length,
    totalEvents:           evts.length,
    approvedEvents:        evts.filter(e => e.status === 'approved').length,
    pendingEvents:         evts.filter(e => e.status === 'pending').length,
    totalViews:            ests.reduce((s, e) => s + e.views, 0),
    totalWhatsappClicks:   ests.reduce((s, e) => s + e.whatsappClicks, 0)
                         + evts.reduce((s, e) => s + e.whatsappClicks, 0),
    totalPhoneClicks:      ests.reduce((s, e) => s + e.phoneClicks, 0)
                         + evts.reduce((s, e) => s + e.phoneClicks, 0),
    totalFavorites:        ests.reduce((s, e) => s + e.favoritesCount, 0),
  };
}
