/**
 * lib/verification-firestore.ts — Label "Vérifié KiffCI" (Sprint 4)
 */
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { logAudit } from './audit-firestore';

export async function setVerifiedStatus(
  establishmentId: string, name: string, isVerified: boolean,
  actorId: string, actorName: string
): Promise<void> {
  await updateDoc(doc(db, 'establishments', establishmentId), { isVerified, updatedAt: Date.now() });
  await logAudit({
    actorId, actorName, action: 'verified_updated', targetType: 'establishment',
    targetId: establishmentId, targetLabel: name,
    details: isVerified ? 'Label "Vérifié KiffCI" activé' : 'Label "Vérifié KiffCI" retiré',
  });
}
