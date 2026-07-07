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
