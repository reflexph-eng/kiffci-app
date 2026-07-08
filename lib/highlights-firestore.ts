/**
 * lib/highlights-firestore.ts — Écriture des champs de mise en avant (Sprint 8)
 * Réservé à l'admin — verrouillé côté règles Firestore (voir keepsProtectedFields).
 */
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { HighlightPatch } from './highlights';
import { logAudit } from './audit-firestore';

type Kind = 'establishment' | 'event' | 'experience';

function collectionName(kind: Kind) {
  if (kind === 'establishment') return 'establishments';
  if (kind === 'event') return 'events';
  return 'experiences';
}

export async function updateHighlight(
  kind: Kind, targetId: string, targetName: string, patch: HighlightPatch,
  actorId: string, actorName: string
): Promise<void> {
  await updateDoc(doc(db, collectionName(kind), targetId), { ...patch, updatedAt: Date.now() });
  await logAudit({
    actorId, actorName, action: 'highlight_updated', targetType: kind, targetId, targetLabel: targetName,
    details: `Badge: ${patch.highlightBadge ?? '—'} · Statut: ${patch.highlightStatus ?? '—'}` +
      (patch.highlightSections?.length ? ` · Sections: ${patch.highlightSections.join(', ')}` : ''),
  });
}
