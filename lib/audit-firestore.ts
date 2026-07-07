/**
 * lib/audit-firestore.ts — Journal d'audit des actions admin (Sprint 3)
 */
import { collection, addDoc, getDocs, query, orderBy, limit as fbLimit } from 'firebase/firestore';
import { db } from './firebase';
import { AuditLog } from '@/types';

export async function logAudit(data: Omit<AuditLog, 'id' | 'createdAt'>): Promise<void> {
  try {
    await addDoc(collection(db, 'auditLogs'), { ...data, createdAt: Date.now() });
  } catch {
    // Le journal ne doit jamais bloquer l'action principale.
  }
}

export async function getRecentAuditLogs(max = 50): Promise<AuditLog[]> {
  const snap = await getDocs(query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc'), fbLimit(max)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog));
}
