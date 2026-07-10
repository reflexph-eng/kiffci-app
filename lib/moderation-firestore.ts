/**
 * lib/moderation-firestore.ts — Modération professionnelle (Sprint 3)
 * Motif obligatoire pour rejet, historique consultable par cible.
 */
import {
  collection, doc, addDoc, getDocs, updateDoc, query, where, orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { ModerationLog, Status } from '@/types';
import { logAudit } from './audit-firestore';

type Kind = 'establishment' | 'experience' | 'event';

function collectionName(kind: Kind) {
  if (kind === 'establishment') return 'establishments';
  if (kind === 'experience') return 'experiences';
  return 'events';
}

export async function moderateWithReason(
  kind: Kind,
  targetId: string,
  targetName: string,
  status: Status,
  reason: string,
  actorId: string,
  actorName: string
): Promise<void> {
  await updateDoc(doc(db, collectionName(kind), targetId), {
    status,
    moderationNote: reason,
    updatedAt: Date.now(),
  });

  await addDoc(collection(db, 'moderationLogs'), {
    kind, targetId, targetName,
    action: status === 'approved' ? 'approved' : 'rejected',
    reason, moderatorId: actorId, moderatorName: actorName,
    createdAt: Date.now(),
  });

  await logAudit({
    actorId, actorName, action: 'moderation', targetType: kind,
    targetId, targetLabel: targetName,
    details: `${status === 'approved' ? 'Approuvé' : 'Rejeté'}${reason ? ` — Motif : ${reason}` : ''}`,
  });
}

export async function getModerationHistory(kind: Kind, targetId: string): Promise<ModerationLog[]> {
  const q = query(
    collection(db, 'moderationLogs'),
    where('kind', '==', kind), where('targetId', '==', targetId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as ModerationLog))
    .sort((a, b) => b.createdAt - a.createdAt);
}
