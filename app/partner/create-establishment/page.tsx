'use client';
import { useState, FormEvent } from 'react';
import AuthGuard from '@/components/AuthGuard';
import ImageUploader from '@/components/ImageUploader';
import { useAuth } from '@/context/AuthContext';
import { createEstablishment } from '@/lib/partner-firestore';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Store } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = ['Restaurant', 'Bar / Lounge', 'Hôtel', 'Spa / Bien-être', 'Loisirs / Sport', 'Culture / Art', 'Shopping', 'Salle d\'événements', 'Club / Discothèque', 'Autre'];

function CreateEstablishmentContent() {
  const { appUser } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [toast,  setToast]  = useState('');
  const [images, setImages] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: '', description: '', category: '', city: 'Abidjan',
    district: '', address: '', latitude: 5.354, longitude: -4.008,
    phone: '', whatsapp: '', email: '', website: '',
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  function set(field: keyof typeof form, value: string | number) {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: undefined }));
  }

  function validate() {
    const e: Partial<typeof form> = {};
    if (!form.name.trim())        e.name        = 'Requis';
    if (!form.description.trim()) e.description = 'Requis';
    if (!form.category)           e.category    = 'Requis';
    if (!form.district.trim())    e.district    = 'Requis';
    if (!form.phone.trim())       e.phone       = 'Requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate() || !appUser) return;
    setSaving(true);
    try {
      await createEstablishment({
        ...form,
        images,
        ownerId:     appUser.uid,
        ownerName:   appUser.displayName,
        status:      'pending',
        isFeatured:  false,
        isSponsored: false,
        isVerified:  false,
      });
      setToast('Établissement soumis ! En attente de validation.');
      setTimeout(() => router.push('/partner/establishments'), 2000);
    } catch {
      setToast('Erreur. Réessaie.');
    } finally {
      setSaving(false);
    }
  }

  const fields: [keyof typeof form, string, string][] = [
    ['name',        'Nom de l\'établissement *', 'text'],
    ['city',        'Ville',                     'text'],
    ['district',    'Quartier / District *',      'text'],
    ['address',     'Adresse complète',           'text'],
    ['phone',       'Téléphone *',                'text'],
    ['whatsapp',    'WhatsApp',                   'text'],
    ['email',       'Email',                      'email'],
    ['website',     'Site web',                   'url'],
    ['latitude',    'Latitude',                   'number'],
    ['longitude',   'Longitude',                  'number'],
  ];

  return (
    <div>
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-anthracite text-white px-5 py-3 rounded-2xl shadow-soft font-semibold animate-fadeUp">{toast}</div>
      )}
      <Link href="/partner/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-solar mb-6">
        <ArrowLeft size={16} /> Retour au dashboard
      </Link>
      <h1 className="font-display font-bold text-4xl text-anthracite mb-2 flex items-center gap-3">
        <Store size={28} className="text-solar" /> Ajouter un établissement
      </h1>
      <p className="text-gray-500 mb-8">Ton établissement sera examiné et publié sous 24h.</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-4xl shadow-card p-8 space-y-5 max-w-2xl">
        {/* Catégorie */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Catégorie *</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}
            className={`w-full border rounded-2xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar ${errors.category ? 'border-red-400' : 'border-gray-200'}`}>
            <option value="">Choisir une catégorie</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
        </div>

        {/* Champs texte */}
        {fields.map(([field, label, type]) => (
          <div key={field}>
            <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
            <input type={type} value={form[field]} onChange={e => set(field, type === 'number' ? Number(e.target.value) : e.target.value)}
              className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar ${errors[field] ? 'border-red-400' : 'border-gray-200'}`} />
            {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
          </div>
        ))}

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Description *</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4}
            placeholder="Décris ton établissement, ce qui le rend unique..."
            className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`} />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
        </div>

        {/* Images */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2">Photos (max 5)</label>
          <ImageUploader folder="establishments" entityId={`temp_${appUser?.uid}`} images={images} onChange={setImages} max={5} />
        </div>

        <button type="submit" disabled={saving}
          className="w-full bg-solar text-white rounded-2xl py-3.5 font-bold text-sm hover:bg-orange-600 transition disabled:opacity-60 flex items-center justify-center gap-2">
          {saving ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '📤 Soumettre pour validation'}
        </button>
      </form>
    </div>
  );
}

export default function CreateEstablishmentPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <AuthGuard partnerOnly>
        <CreateEstablishmentContent />
      </AuthGuard>
    </main>
  );
}
