'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import CmsImageUpload from '@/components/CmsImageUpload';
import { getBanners, createBanner, updateBanner, deleteBanner, toggleBanner } from '@/lib/cms-firestore';
import { Banner } from '@/types';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Check, GripVertical } from 'lucide-react';

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

const EMPTY: Omit<Banner, 'id' | 'createdAt'> = {
  title: '', subtitle: '', imageUrl: '', buttonText: '', buttonLink: '',
  textColor: '#FFFFFF', buttonBgColor: '#E89A16', buttonTextColor: '#FFFFFF',
  position: 1, isActive: true, startDate: '', endDate: '',
};

function BannersContent() {
  const [banners,  setBanners]  = useState<Banner[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState('');
  const [editing,  setEditing]  = useState<(Omit<Banner, 'id' | 'createdAt'> & { id?: string }) | null>(null);
  const [confirm,  setConfirm]  = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function load() {
    setBanners(await getBanners());
  }

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  async function save() {
    if (!editing?.title || !editing?.imageUrl) { showToast('Titre et image requis.'); return; }
    const colors = [editing.textColor, editing.buttonBgColor, editing.buttonTextColor];
    if (colors.some(color => color && !HEX_COLOR.test(color))) {
      showToast('Une couleur est invalide. Utilise le format #FFFFFF.');
      return;
    }
    setSaving(true);
    try {
      if (editing.id) {
        const { id, ...data } = editing as Banner;
        await updateBanner(id, data);
        showToast('Bannière mise à jour ✓');
      } else {
        await createBanner(editing as Omit<Banner, 'id' | 'createdAt'>);
        showToast('Bannière créée ✓');
      }
      setEditing(null); load();
    } catch { showToast('Erreur.'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    await deleteBanner(id);
    setConfirm(null); showToast('Bannière supprimée'); load();
  }

  async function handleToggle(id: string, current: boolean) {
    await toggleBanner(id, !current);
    load();
  }

  if (loading) return <div className="flex justify-center mt-20"><div className="w-10 h-10 border-4 border-solar border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      {toast && <div className="fixed top-20 right-4 z-50 bg-anthracite text-white px-5 py-3 rounded-2xl shadow-soft font-semibold animate-fadeUp">{toast}</div>}

      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-4xl text-anthracite">Bannières</h1>
          <p className="text-gray-500 mt-1">{banners.length} bannière{banners.length > 1 ? 's' : ''} · Affichées sur la page d'accueil</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY, position: banners.length + 1 })}
          className="bg-solar text-white px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-orange-600 transition">
          <Plus size={16} /> Nouvelle bannière
        </button>
      </div>

      {/* Form */}
      {editing && (
        <div className="bg-white rounded-4xl shadow-soft p-6 mb-8 border-2 border-solar/20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-2xl">{editing.id ? 'Modifier' : 'Nouvelle'} bannière</h2>
            <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-4">
              {[
                ['title',      'Titre *'],
                ['subtitle',   'Sous-titre'],
                ['buttonText', 'Texte du bouton'],
                ['buttonLink', 'Lien du bouton'],
              ].map(([field, label]) => (
                <div key={field}>
                  <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
                  <input type="text" value={(editing as unknown as Record<string, string>)[field] ?? ''}
                    onChange={e => setEditing(p => ({ ...p!, [field]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar" />
                </div>
              ))}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-gray-500">Couleurs de la bannière</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ['textColor', 'Texte'],
                    ['buttonBgColor', 'Fond du bouton'],
                    ['buttonTextColor', 'Texte du bouton'],
                  ].map(([field, label]) => {
                    const value = (editing as unknown as Record<string, string>)[field] || '#FFFFFF';
                    const pickerValue = HEX_COLOR.test(value) ? value : '#FFFFFF';
                    return (
                      <div key={field}>
                        <label className="mb-1 block text-xs font-bold text-gray-500">{label}</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={pickerValue}
                            onChange={e => setEditing(p => ({ ...p!, [field]: e.target.value.toUpperCase() }))}
                            className="h-11 w-12 cursor-pointer rounded-lg border border-gray-200 bg-white p-1"
                            aria-label={`Choisir la couleur : ${label}`}
                          />
                          <input
                            type="text"
                            value={value}
                            maxLength={7}
                            onChange={e => setEditing(p => ({ ...p!, [field]: e.target.value }))}
                            className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-mono uppercase focus:border-solar focus:outline-none focus:ring-2 focus:ring-solar/30"
                            placeholder="#FFFFFF"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-gray-400">Utilise le sélecteur ou saisis une couleur hexadécimale, par exemple #FFFFFF.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Position</label>
                  <input type="number" min={1} value={editing.position}
                    onChange={e => setEditing(p => ({ ...p!, position: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editing.isActive}
                      onChange={e => setEditing(p => ({ ...p!, isActive: e.target.checked }))}
                      className="rounded accent-orange-500 w-4 h-4" />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Date début</label>
                  <input type="date" value={editing.startDate}
                    onChange={e => setEditing(p => ({ ...p!, startDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Date fin</label>
                  <input type="date" value={editing.endDate}
                    onChange={e => setEditing(p => ({ ...p!, endDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30" />
                </div>
              </div>
            </div>
            <div>
              <CmsImageUpload
                folder="cms/banners"
                value={editing.imageUrl}
                onChange={url => setEditing(p => ({ ...p!, imageUrl: url }))}
                label="Image de la bannière *"
                height={220}
              />
              <p className="mt-2 text-xs leading-relaxed text-gray-500">Format conseillé : image horizontale 1600 × 600 px minimum, sujet principal centré ou placé à droite, poids idéal inférieur à 800 Ko.</p>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={save} disabled={saving}
              className="bg-solar text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-orange-600 transition disabled:opacity-60">
              {saving ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={18} />}
              {editing.id ? 'Mettre à jour' : 'Créer'}
            </button>
            <button onClick={() => setEditing(null)} className="border border-gray-200 px-6 py-3 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {banners.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-4xl shadow-card">
          <p className="text-5xl mb-4">🖼️</p>
          <h3 className="font-display font-bold text-xl">Aucune bannière</h3>
          <p className="text-gray-500 mt-2">Crée ta première bannière pour l'afficher sur l'accueil.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map(b => (
            <div key={b.id} className="bg-white rounded-3xl shadow-card overflow-hidden">
              <div className="flex items-start gap-4 p-4">
                <div className="text-gray-300 cursor-grab mt-1"><GripVertical size={18} /></div>
                {b.imageUrl && (
                  <img src={b.imageUrl} alt={b.title} className="w-28 h-16 rounded-xl object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-display font-bold text-base">{b.title}</p>
                      {b.subtitle && <p className="text-sm text-gray-500 truncate">{b.subtitle}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">Position {b.position} · {b.startDate} → {b.endDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${b.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {b.isActive ? '✅ Active' : '⏸️ Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4 flex gap-2 border-t border-gray-50 pt-3">
                <button onClick={() => setEditing(b)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium hover:bg-gray-50 transition">
                  <Edit2 size={13} /> Modifier
                </button>
                <button onClick={() => handleToggle(b.id, b.isActive)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium hover:bg-gray-50 transition">
                  {b.isActive ? <><EyeOff size={13} /> Désactiver</> : <><Eye size={13} /> Activer</>}
                </button>
                {confirm === b.id ? (
                  <div className="flex gap-1.5 items-center">
                    <span className="text-xs text-gray-500">Confirmer ?</span>
                    <button onClick={() => handleDelete(b.id)} className="px-2.5 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold">Oui</button>
                    <button onClick={() => setConfirm(null)} className="px-2.5 py-1.5 bg-gray-100 rounded-xl text-xs">Non</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirm(b.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-red-500 hover:bg-red-50 hover:border-red-200 transition">
                    <Trash2 size={13} /> Supprimer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminBannersPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <AuthGuard adminOnly><BannersContent /></AuthGuard>
    </main>
  );
}
