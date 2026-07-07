'use client';
import { useState, useEffect, FormEvent } from 'react';
import AuthGuard from '@/components/AuthGuard';
import ImageUploader from '@/components/ImageUploader';
import { useAuth } from '@/context/AuthContext';
import { createEvent, getMyEstablishments } from '@/lib/partner-firestore';
import { Establishment } from '@/types';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

function CreateEventContent() {
  const { appUser } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [toast,  setToast]  = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [ests,   setEsts]   = useState<Establishment[]>([]);

  const [form, setForm] = useState({
    title: '', description: '', startDate: '', endDate: '',
    city: 'Abidjan', location: '', price: 'Gratuit',
    capacity: '', contactPhone: '', whatsapp: '', establishmentId: '',
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  useEffect(() => {
    if (appUser) getMyEstablishments(appUser.uid).then(setEsts);
  }, [appUser]);

  function set(field: keyof typeof form, value: string) {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: undefined }));
  }

  function validate() {
    const e: Partial<typeof form> = {};
    if (!form.title.trim())       e.title       = 'Requis';
    if (!form.description.trim()) e.description = 'Requis';
    if (!form.startDate)          e.startDate   = 'Requis';
    if (!form.endDate)            e.endDate     = 'Requis';
    if (!form.location.trim())    e.location    = 'Requis';
    if (!form.contactPhone.trim())e.contactPhone= 'Requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate() || !appUser) return;
    setSaving(true);
    try {
      await createEvent({
        title:           form.title,
        description:     form.description,
        startDate:       form.startDate,
        endDate:         form.endDate,
        city:            form.city,
        location:        form.location,
        price:           form.price,
        capacity:        form.capacity ? Number(form.capacity) : undefined,
        images,
        organizerId:     appUser.uid,
        organizerName:   appUser.displayName,
        establishmentId: form.establishmentId || undefined,
        contactPhone:    form.contactPhone,
        whatsapp:        form.whatsapp,
        status:          'pending',
        isFeatured:      false,
        isSponsored:     false,
      });
      setToast('Événement soumis ! En attente de validation.');
      setTimeout(() => router.push('/partner/events'), 2000);
    } catch {
      setToast('Erreur. Réessaie.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-anthracite text-white px-5 py-3 rounded-2xl shadow-soft font-semibold animate-fadeUp">{toast}</div>
      )}
      <Link href="/partner/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-solar mb-6">
        <ArrowLeft size={16} /> Retour au dashboard
      </Link>
      <h1 className="font-display font-bold text-4xl text-anthracite mb-2 flex items-center gap-3">
        <Calendar size={28} className="text-solar" /> Publier un événement
      </h1>
      <p className="text-gray-500 mb-8">Ton événement sera examiné et publié sous 24h.</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-4xl shadow-card p-8 space-y-5 max-w-2xl">

        {/* Titre */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Titre de l'événement *</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
            className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar ${errors.title ? 'border-red-400' : 'border-gray-200'}`} />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Description *</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4}
            placeholder="Décris l'événement, le programme, les artistes..."
            className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`} />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Date de début *</label>
            <input type="datetime-local" value={form.startDate} onChange={e => set('startDate', e.target.value)}
              className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar ${errors.startDate ? 'border-red-400' : 'border-gray-200'}`} />
            {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Date de fin *</label>
            <input type="datetime-local" value={form.endDate} onChange={e => set('endDate', e.target.value)}
              className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar ${errors.endDate ? 'border-red-400' : 'border-gray-200'}`} />
            {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
          </div>
        </div>

        {/* Lieu */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Ville</label>
            <input type="text" value={form.city} onChange={e => set('city', e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Lieu exact *</label>
            <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
              placeholder="Nom du lieu, adresse..."
              className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar ${errors.location ? 'border-red-400' : 'border-gray-200'}`} />
            {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
          </div>
        </div>

        {/* Prix & Capacité */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Prix</label>
            <input type="text" value={form.price} onChange={e => set('price', e.target.value)}
              placeholder="Ex: Gratuit, 5 000 FCFA..."
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Capacité (places)</label>
            <input type="number" value={form.capacity} onChange={e => set('capacity', e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar" />
          </div>
        </div>

        {/* Contacts */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Téléphone contact *</label>
            <input type="text" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)}
              className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar ${errors.contactPhone ? 'border-red-400' : 'border-gray-200'}`} />
            {errors.contactPhone && <p className="text-xs text-red-500 mt-1">{errors.contactPhone}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">WhatsApp</label>
            <input type="text" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar" />
          </div>
        </div>

        {/* Lier à un établissement */}
        {ests.length > 0 && (
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Lier à un de mes établissements (optionnel)</label>
            <select value={form.establishmentId} onChange={e => set('establishmentId', e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar">
              <option value="">Aucun</option>
              {ests.filter(e => e.status === 'approved').map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Images */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2">Photos de l'événement (max 5)</label>
          <ImageUploader folder="events" entityId={`temp_${appUser?.uid}`} images={images} onChange={setImages} max={5} />
        </div>

        <button type="submit" disabled={saving}
          className="w-full bg-solar text-white rounded-2xl py-3.5 font-bold text-sm hover:bg-orange-600 transition disabled:opacity-60 flex items-center justify-center gap-2">
          {saving ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '📤 Soumettre pour validation'}
        </button>
      </form>
    </div>
  );
}

export default function CreateEventPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <AuthGuard partnerOnly>
        <CreateEventContent />
      </AuthGuard>
    </main>
  );
}
