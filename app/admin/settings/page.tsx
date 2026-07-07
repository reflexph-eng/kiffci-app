'use client';
import { useEffect, useState, FormEvent } from 'react';
import AuthGuard from '@/components/AuthGuard';
import CmsImageUpload from '@/components/CmsImageUpload';
import { getHomepageSettings, saveHomepageSettings, DEFAULT_HOMEPAGE } from '@/lib/cms-firestore';
import { HomepageSettings } from '@/types';
import { useCms } from '@/context/CmsContext';
import { Save, Settings, AlertTriangle, Eye } from 'lucide-react';
import Link from 'next/link';

function SettingsContent() {
  const { refresh } = useCms();
  const [form,    setForm]    = useState<Omit<HomepageSettings, 'updatedAt'>>(DEFAULT_HOMEPAGE);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState('');
  const [toastOk, setToastOk] = useState(true);

  function showToast(msg: string, ok = true) {
    setToast(msg); setToastOk(ok);
    setTimeout(() => setToast(''), 3500);
  }

  useEffect(() => {
    getHomepageSettings()
      .then(s => setForm(s))
      .finally(() => setLoading(false));
  }, []);

  function set(field: keyof typeof form, value: string | boolean | string[]) {
    setForm(p => ({ ...p, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveHomepageSettings(form);
      await refresh();
      showToast('✅ Paramètres sauvegardés !');
    } catch {
      showToast('❌ Erreur. Réessaie.', false);
    } finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center mt-20"><div className="w-10 h-10 border-4 border-solar border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-2xl shadow-soft font-semibold animate-fadeUp ${toastOk ? 'bg-anthracite text-white' : 'bg-red-600 text-white'}`}>
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-4xl text-anthracite flex items-center gap-3">
            <Settings size={32} className="text-solar" /> Paramètres du site
          </h1>
          <p className="text-gray-500 mt-1">Modifie le contenu de la page d'accueil sans toucher au code.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/" target="_blank"
            className="flex items-center gap-2 border border-gray-200 px-4 py-2.5 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
            <Eye size={16} /> Prévisualiser
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mode maintenance */}
        <div className={`rounded-3xl p-6 border-2 ${form.maintenanceMode ? 'bg-red-50 border-red-300' : 'bg-white border-gray-100 shadow-card'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle size={22} className={form.maintenanceMode ? 'text-red-600' : 'text-gray-400'} />
              <div>
                <p className="font-display font-bold text-lg">Mode maintenance</p>
                <p className="text-sm text-gray-500">Active pour afficher une page de maintenance aux visiteurs.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={form.maintenanceMode} onChange={e => set('maintenanceMode', e.target.checked)} className="sr-only peer" />
              <div className="w-12 h-6 bg-gray-200 rounded-full peer-checked:bg-red-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-6"></div>
            </label>
          </div>
          {form.maintenanceMode && (
            <div className="mt-4 bg-red-100 rounded-2xl px-4 py-3 text-sm text-red-700 font-semibold">
              ⚠️ Le site est actuellement en maintenance. Les visiteurs voient une page d'indisponibilité.
            </div>
          )}
        </div>

        {/* Hero content */}
        <div className="bg-white rounded-4xl shadow-card p-6 space-y-5">
          <h2 className="font-display font-bold text-2xl">Contenu Hero</h2>

          <CmsImageUpload
            folder="cms/homepage"
            value={form.heroImageUrl}
            onChange={url => set('heroImageUrl', url)}
            label="Image principale (hero)"
            height={200}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Titre principal *</label>
              <input type="text" value={form.heroTitle} onChange={e => set('heroTitle', e.target.value)}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Slogan (badge)</label>
              <input type="text" value={form.slogan} onChange={e => set('slogan', e.target.value)}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Sous-titre / description</label>
            <textarea value={form.heroSubtitle} onChange={e => set('heroSubtitle', e.target.value)} rows={3}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 resize-none" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Texte du bouton principal</label>
              <input type="text" value={form.heroButtonText} onChange={e => set('heroButtonText', e.target.value)}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Lien du bouton principal</label>
              <input type="text" value={form.heroButtonLink} onChange={e => set('heroButtonLink', e.target.value)}
                placeholder="/experiences"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar" />
            </div>
          </div>
        </div>

        {/* Mise en avant */}
        <div className="bg-white rounded-4xl shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-2xl">Contenu mis en avant</h2>
          <p className="text-sm text-gray-500">Entre les IDs Firestore séparés par des virgules. Laisse vide pour utiliser la sélection automatique.</p>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">IDs d'expériences mises en avant</label>
            <input type="text" value={form.featuredExperienceIds.join(', ')}
              onChange={e => set('featuredExperienceIds', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="id1, id2, id3…"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">IDs d'événements mis en avant</label>
            <input type="text" value={form.featuredEventIds.join(', ')}
              onChange={e => set('featuredEventIds', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="id1, id2…"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">IDs d'établissements mis en avant</label>
            <input type="text" value={form.featuredEstablishmentIds.join(', ')}
              onChange={e => set('featuredEstablishmentIds', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="id1, id2…"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar" />
          </div>
        </div>

        {/* App info */}
        <div className="bg-white rounded-4xl shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-2xl">Informations application</h2>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Version de l'application</label>
            <input type="text" value={form.appVersion} onChange={e => set('appVersion', e.target.value)}
              className="w-full md:w-48 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar" />
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full md:w-auto bg-solar text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition disabled:opacity-60">
          {saving ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
          Sauvegarder les paramètres
        </button>
      </form>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <AuthGuard adminOnly>
        <SettingsContent />
      </AuthGuard>
    </main>
  );
}
