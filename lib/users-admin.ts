/**
 * lib/users-admin.ts — Gestion des utilisateurs et rôles (Sprint 3)
 */
import {
  collection, doc, getDoc, getDocs, updateDoc, query, orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { AppUser, UserRole } from '@/types';
import { logAudit } from './audit-firestore';

function toUser(d: Record<string, unknown>): AppUser {
  return {
    uid:             (d.uid as string) ?? '',
    email:           (d.email as string) ?? '',
    displayName:     (d.displayName as string) ?? '',
    photoURL:        d.photoURL as string | undefined,
    role:            (d.role as UserRole) ?? 'user',
    points:          (d.points as number) ?? 0,
    level:           (d.level as string) ?? 'Débutant',
    badges:          (d.badges as string[]) ?? [],
    isSuspended:     (d.isSuspended as boolean) ?? false,
    suspendedReason: d.suspendedReason as string | undefined,
    createdAt:       (d.createdAt as number) ?? Date.now(),
  };
}

export async function getAllUsersAdmin(): Promise<AppUser[]> {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => toUser({ uid: d.id, ...d.data() }));
}

export async function changeUserRole(
  uid: string, newRole: UserRole, actorId: string, actorName: string
): Promise<void> {
  const before = await getDoc(doc(db, 'users', uid));
  const prevRole = before.exists() ? (before.data().role as UserRole) : 'user';
  await updateDoc(doc(db, 'users', uid), { role: newRole, updatedAt: Date.now() });
  await logAudit({
    actorId, actorName, action: 'role_changed', targetType: 'user', targetId: uid,
    targetLabel: before.exists() ? (before.data().displayName as string) ?? uid : uid,
    details: `Rôle changé de "${prevRole}" à "${newRole}"`,
  });
}

export async function setUserSuspended(
  uid: string, suspended: boolean, reason: string, actorId: string, actorName: string
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    isSuspended: suspended,
    suspendedReason: suspended ? reason : '',
    updatedAt: Date.now(),
  });
  await logAudit({
    actorId, actorName,
    action: suspended ? 'user_suspended' : 'user_unsuspended',
    targetType: 'user', targetId: uid, targetLabel: uid,
    details: suspended ? `Motif : ${reason || '(non précisé)'}` : 'Compte réactivé',
  });
}
