/**
 * lib/subscriptions-firestore.ts — Gestion Premium / Sponsorisé (Sprint 3)
 */
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { logAudit } from './audit-firestore';

type Kind = 'establishment' | 'event';

function collectionName(kind: Kind) {
  return kind === 'establishment' ? 'establishments' : 'events';
}

/** Active ou désactive le statut Premium (isFeatured) avec échéance optionnelle. */
export async function setPremiumStatus(
  kind: Kind, targetId: string, targetName: string,
  isFeatured: boolean, premiumUntil: number | undefined,
  actorId: string, actorName: string
): Promise<void> {
  await updateDoc(doc(db, collectionName(kind), targetId), {
    isFeatured, premiumUntil: premiumUntil ?? null, updatedAt: Date.now(),
  });
  await logAudit({
    actorId, actorName, action: 'premium_updated', targetType: kind, targetId, targetLabel: targetName,
    details: isFeatured
      ? `Premium activé${premiumUntil ? ` jusqu'au ${new Date(premiumUntil).toLocaleDateString('fr-FR')}` : ''}`
      : 'Premium désactivé',
  });
}

/** Active ou désactive le statut Sponsorisé (mis en avant payant). */
export async function setSponsoredStatus(
  kind: Kind, targetId: string, targetName: string,
  isSponsored: boolean, actorId: string, actorName: string
): Promise<void> {
  await updateDoc(doc(db, collectionName(kind), targetId), {
    isSponsored, updatedAt: Date.now(),
  });
  await logAudit({
    actorId, actorName, action: 'sponsored_updated', targetType: kind, targetId, targetLabel: targetName,
    details: isSponsored ? 'Sponsorisé activé' : 'Sponsorisé désactivé',
  });
}

/**
 * Active une fenêtre d'accès prioritaire de 24h réservée aux niveaux élevés
 * (Palier 1 — fidélisation sans dépendance partenaire).
 */
export async function setEarlyAccess(
  kind: Kind, targetId: string, targetName: string,
  enabled: boolean, actorId: string, actorName: string
): Promise<void> {
  const earlyAccessUntil = enabled ? Date.now() + 24 * 3600 * 1000 : null;
  await updateDoc(doc(db, collectionName(kind), targetId), { earlyAccessUntil, updatedAt: Date.now() });
  await logAudit({
    actorId, actorName, action: 'early_access_updated', targetType: kind, targetId, targetLabel: targetName,
    details: enabled ? "Accès prioritaire 24h activé" : 'Accès prioritaire retiré',
  });
}
