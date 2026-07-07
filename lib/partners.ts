import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, increment, query,
  serverTimestamp, setDoc, updateDoc, where
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from './firebase';
import { Establishment, KiffEvent, PublicationStatus } from '@/types';

const now = Date.now();

const demoEstablishments: Establishment[] = [
  {
    id: 'demo-bushman',
    name: 'Bushman Café',
    description: 'Restaurant culturel, rooftop et lieu de rencontres créatives à Abidjan.',
    category: 'Restaurant & culture',
    city: 'Abidjan',
    district: 'Riviera',
    address: 'Riviera Mpouto, Abidjan',
    latitude: 5.35,
    longitude: -3.96,
    phone: '+225 07 59 49 66 51',
    whatsapp: '+225 07 59 49 66 51',
    email: 'bushmancafehotel@gmail.com',
    website: '',
    images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'],
    ownerId: 'demo',
    status: 'approved',
    views: 0,
    favoritesCount: 0,
    whatsappClicks: 0,
    phoneClicks: 0,
    isFeatured: true,
    isSponsored: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-playzone',
    name: 'Play Zone Marcory',
    description: 'Bowling, billard et arcades pour sorties entre amis ou team building.',
    category: 'Jeux indoor',
    city: 'Abidjan',
    district: 'Marcory',
    address: 'Grand carrefour VGE, Marcory',
    latitude: 5.30,
    longitude: -3.99,
    phone: '+225 01 70 90 09 00',
    whatsapp: '+225 01 70 90 09 00',
    email: '',
    website: '',
    images: ['https://images.unsplash.com/photo-1577741314755-048d8525d31e?auto=format&fit=crop&w=1200&q=80'],
    ownerId: 'demo',
    status: 'approved',
    views: 0,
    favoritesCount: 0,
    whatsappClicks: 0,
    phoneClicks: 0,
    isFeatured: false,
    isSponsored: false,
    createdAt: now,
    updatedAt: now,
  },
];

const demoEvents: KiffEvent[] = [
  {
    id: 'demo-reggae-night',
    title: 'Reggae Night Abidjan',
    description: 'Soirée live reggae, food et ambiance roots.',
    startDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 7 + 10800000).toISOString(),
    city: 'Abidjan',
    location: 'Zone 4',
    price: '5 000 FCFA',
    capacity: 250,
    images: ['https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80'],
    organizerId: 'demo',
    contactPhone: '+225 07 00 00 00 00',
    whatsapp: '+225 07 00 00 00 00',
    status: 'approved',
    views: 0,
    favoritesCount: 0,
    whatsappClicks: 0,
    phoneClicks: 0,
    isFeatured: true,
    isSponsored: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-family-day',
    title: 'Family Day Loisirs',
    description: 'Journée familiale avec jeux, food, animations enfants et musique.',
    startDate: new Date(Date.now() + 86400000 * 14).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 14 + 21600000).toISOString(),
    city: 'Abidjan',
    location: 'Koumassi',
    price: 'Entrée libre',
    capacity: 500,
    images: ['https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80'],
    organizerId: 'demo',
    contactPhone: '+225 05 00 00 00 00',
    whatsapp: '+225 05 00 00 00 00',
    status: 'approved',
    views: 0,
    favoritesCount: 0,
    whatsappClicks: 0,
    phoneClicks: 0,
    isFeatured: false,
    isSponsored: false,
    createdAt: now,
    updatedAt: now,
  },
];

export async function becomePartner(uid: string) {
  await setDoc(doc(db, 'users', uid), { role: 'partner', updatedAt: serverTimestamp() }, { merge: true });
}

export async function getApprovedEstablishments(): Promise<Establishment[]> {
  if (!isFirebaseConfigured) return demoEstablishments;
  try {
    const snap = await getDocs(query(collection(db, 'establishments'), where('status', '==', 'approved')));
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Establishment));
    return rows.length ? rows : demoEstablishments;
  } catch (e) {
    console.error(e);
    return demoEstablishments;
  }
}

export async function getApprovedEvents(): Promise<KiffEvent[]> {
  if (!isFirebaseConfigured) return demoEvents;
  try {
    const snap = await getDocs(query(collection(db, 'events'), where('status', '==', 'approved')));
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() } as KiffEvent));
    return rows.length ? rows.sort((a, b) => String(a.startDate).localeCompare(String(b.startDate))) : demoEvents;
  } catch (e) {
    console.error(e);
    return demoEvents;
  }
}

export async function getPartnerEstablishments(uid: string): Promise<Establishment[]> {
  const snap = await getDocs(query(collection(db, 'establishments'), where('ownerId', '==', uid)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Establishment));
}

export async function getPartnerEvents(uid: string): Promise<KiffEvent[]> {
  const snap = await getDocs(query(collection(db, 'events'), where('organizerId', '==', uid)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as KiffEvent));
}

export async function createEstablishment(data: Omit<Establishment, 'id' | 'createdAt' | 'updatedAt'>) {
  const refDoc = await addDoc(collection(db, 'establishments'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return refDoc.id;
}

export async function updateEstablishment(id: string, data: Partial<Establishment>) {
  await updateDoc(doc(db, 'establishments', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEstablishment(id: string) {
  await deleteDoc(doc(db, 'establishments', id));
}

export async function createEvent(data: Omit<KiffEvent, 'id' | 'createdAt' | 'updatedAt'>) {
  const refDoc = await addDoc(collection(db, 'events'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return refDoc.id;
}

export async function updateEvent(id: string, data: Partial<KiffEvent>) {
  await updateDoc(doc(db, 'events', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEvent(id: string) {
  await deleteDoc(doc(db, 'events', id));
}

export async function uploadPartnerImage(kind: 'establishments' | 'events', id: string, file: File) {
  const storageRef = ref(storage, `${kind}/${id}/${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function getPendingPublications() {
  const [est, ev] = await Promise.all([
    getDocs(query(collection(db, 'establishments'), where('status', '==', 'pending'))),
    getDocs(query(collection(db, 'events'), where('status', '==', 'pending'))),
  ]);

  return {
    establishments: est.docs.map((d) => ({ id: d.id, ...d.data() } as Establishment)),
    events: ev.docs.map((d) => ({ id: d.id, ...d.data() } as KiffEvent)),
  };
}

export async function moderatePublication(
  kind: 'establishments' | 'events',
  id: string,
  status: PublicationStatus
) {
  await updateDoc(doc(db, kind, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function trackPartnerMetric(
  kind: 'establishments' | 'events',
  id: string,
  field: 'views' | 'favoritesCount' | 'whatsappClicks' | 'phoneClicks'
) {
  const refDoc = doc(db, kind, id);
  const snap = await getDoc(refDoc);
  if (snap.exists()) {
    await updateDoc(refDoc, { [field]: increment(1) });
  }
}