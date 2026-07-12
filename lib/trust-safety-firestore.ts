import {
  collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where,
} from 'firebase/firestore';
import { db } from './firebase';
import { CreatorVerificationRequest, CreatorVerificationStatus } from '@/types';

const COLLECTION = 'creatorVerificationRequests';

export async function getMyVerificationRequest(uid: string): Promise<CreatorVerificationRequest | null> {
  const snap = await getDoc(doc(db, COLLECTION, uid));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as CreatorVerificationRequest) : null;
}

export async function saveVerificationDraft(
  uid: string,
  data: Omit<CreatorVerificationRequest, 'id' | 'creatorId' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const ref = doc(db, COLLECTION, uid);
  const current = await getDoc(ref);
  const now = Date.now();
  await setDoc(ref, {
    ...data,
    creatorId: uid,
    status: current.exists() ? current.data().status ?? 'draft' : 'draft',
    createdAt: current.exists() ? current.data().createdAt ?? now : now,
    updatedAt: now,
  }, { merge: true });
}

export async function submitVerificationRequest(uid: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, uid), {
    status: 'pending', submittedAt: Date.now(), updatedAt: Date.now(), adminNote: '',
  });
}

export async function listVerificationRequests(): Promise<CreatorVerificationRequest[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as CreatorVerificationRequest))
    .sort((a, b) => (b.submittedAt ?? b.updatedAt) - (a.submittedAt ?? a.updatedAt));
}

export async function reviewVerificationRequest(
  request: CreatorVerificationRequest,
  status: Exclude<CreatorVerificationStatus, 'draft' | 'pending'>,
  adminNote: string,
  reviewerId: string,
): Promise<void> {
  const now = Date.now();
  await updateDoc(doc(db, COLLECTION, request.id), {
    status, adminNote, reviewedAt: now, reviewedBy: reviewerId, updatedAt: now,
  });

  if (status === 'approved' || status === 'partner') {
    const creatorStatus = status === 'partner' ? 'partner' : 'verified';
    await Promise.all([
      updateDoc(doc(db, 'users', request.creatorId), { creatorStatus, updatedAt: now }),
      setDoc(doc(db, 'publicProfiles', request.creatorId), { creatorStatus, updatedAt: now }, { merge: true }),
    ]);
  }
}

export async function getVerificationPendingCount(): Promise<number> {
  const snap = await getDocs(query(collection(db, COLLECTION), where('status', '==', 'pending')));
  return snap.size;
}
