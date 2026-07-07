'use client';
import { useEffect, useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import ImageUploader from '@/components/ImageUploader';
import { useAuth } from '@/context/AuthContext';
import { getEventById, updateEvent } from '@/lib/partner-firestore';
import { KiffEvent } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function EditEventContent() {
  const { id }      = useParams<{ id: string }>();
  const { appUser } = useAuth();
  const router      = useRouter();
  const [evt,    setEvt]    = useState<KiffEvent | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast,  setToast]  = useState('');
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    getEventById(id as string).then(e => {
      if (!e || e.organizerId !== appUser?.uid) { router.replace('/partner/events'); return; }
      setEvt(e); setImages(e.images);
    });
  }, [id, appUser, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!evt) return;
    setSaving(true);
    try {
      await updateEvent(evt.id, { ...evt, images, status: 'pending' });
      setToast('Mis à jour ! Re-soumis pour validation.');
      setTimeout(() => router.push('/partner/events'), 2000);
    } catch { setToast('Erreur. Réessaie.'); }
    finally { setSaving(false); }
  }

  if (!evt) return <div className="flex justify-center mt-20"><div className="w-10 h-10 border-4 border-solar border-t-transparent rounded-full animate-spin" /></div>;

  function set(field: keyof KiffEvent, value: string | number) {
    setEvt(p => p ? { ...p, [field]: value } : p);
  }

  return (
    <div>
      {toast && <div className="fixed top-20 right-4 z-50 bg-anthracite text-white px-5 py-3 rounded-2xl shadow-soft font-semibold animate-fadeUp">{toast}</div>}
      <Link href="/partner/events" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-solar mb-6">
        <ArrowLeft size={16} /> Retour
      </Link>
      <h1 className="font-display font-bold text-3xl mb-6">Modifier : {evt.title}</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-4xl shadow-card p-8 space-y-5 max-w-2xl">
        {[['title','Titre'],['city','Ville'],['location','Lieu'],['price','Prix'],['contactPhone','Téléphone'],['whatsapp','WhatsApp']].map(([field, label]) => (
          <div key={field}>
            <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
            <input type="text" value={(evt[field as keyof KiffEvent] as string) ?? ''}
              onChange={e => set(field as keyof KiffEvent, e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30" />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Date début</label>
            <input type="datetime-local" value={evt.startDate} onChange={e => set('startDate', e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Date fin</label>
            <input type="datetime-local" value={evt.endDate} onChange={e => set('endDate', e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
          <textarea value={evt.description} onChange={e => set('description', e.target.value)} rows={4}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 resize-none" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2">Photos</label>
          <ImageUploader folder="events" entityId={evt.id} images={images} onChange={setImages} max={5} />
        </div>
        <button type="submit" disabled={saving}
          className="w-full bg-solar text-white rounded-2xl py-3.5 font-bold text-sm hover:bg-orange-600 transition disabled:opacity-60 flex items-center justify-center gap-2">
          {saving ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '💾 Enregistrer les modifications'}
        </button>
      </form>
    </div>
  );
}

export default function EditEventPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <AuthGuard partnerOnly><EditEventContent /></AuthGuard>
    </main>
  );
}
