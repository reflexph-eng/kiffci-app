'use client';
/** /admin/ads — gestion des encarts publicitaires (Sprint 2). */
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { getAllAdsAdmin, createAd, updateAd, deleteAd, AD_SLOTS } from '@/lib/ads-firestore';
import { AdCreative, AdSlotId } from '@/types';
import { Plus, Pencil, Trash2, Megaphone, Eye, EyeOff, BarChart3 } from 'lucide-react';

type Editing = (Omit<AdCreative, 'id' | 'views' | 'clicks' | 'createdAt' | 'updatedAt'> & { id?: string }) | null;

const EMPTY: NonNullable<Editing> = {
  slotId: 'home-hero-bas', title: '', imageUrl: '', linkUrl: '', sponsorName: '',
  startDate: '', endDate: '', isActive: false,
};

export default function AdminAdsPage() {
  const [ads, setAds]         = useState<AdCreative[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Editing>(null);
  const [saving, setSaving]   = useState(false);

  async function refresh() {
    setAds(await getAllAdsAdmin());
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function handleSave() {
    if (!editing || !editing.title.trim() || !editing.imageUrl.trim() || !editing.linkUrl.trim()) return;
    setSaving(true);
    try {
      if (editing.id) {
        const { id, ...rest } = editing;
        await updateAd(id!, rest);
      } else {
        await createAd(editing);
      }
      setEditing(null);
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(a: AdCreative) {
    if (!confirm(`Supprimer l'encart « ${a.title} » ?`)) return;
    await deleteAd(a.id);
    await refresh();
  }

  async function toggleActive(a: AdCreative) {
    await updateAd(a.id, { isActive: !a.isActive });
    await refresh();
  }

  const slotLabel = (id: AdSlotId) => AD_SLOTS.find(s => s.id === id)?.label ?? id;

  return (
    <AuthGuard adminOnly>
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
          <div>
            <h1 className="font-display font-bold text-3xl text-anthracite flex items-center gap-2">
              <Megaphone className="text-solar" aria-hidden /> Encarts publicitaires
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Un emplacement désactivé ou vide n'affiche rien — le site ne se déforme jamais.
            </p>
          </div>
          <button onClick={() => setEditing({ ...EMPTY })}
            className="flex items-center gap-2 bg-solar text-white font-medium px-4 py-2.5 rounded-2xl hover:bg-orange-600 transition text-sm">
            <Plus size={15} aria-hidden /> Nouvel encart
          </button>
        </div>

        {/* Emplacements disponibles */}
        <div className="grid sm:grid-cols-2 gap-2 my-6">
          {AD_SLOTS.map(s => (
            <div key={s.id} className="bg-gray-50 rounded-2xl px-4 py-3">
              <p className="text-sm font-medium text-anthracite">{s.label}</p>
              <p className="text-xs text-gray-400">{s.hint}</p>
            </div>
          ))}
        </div>

        {editing && (
          <div className="bg-white rounded-4xl shadow-card p-6 mb-8 space-y-4">
            <h2 className="font-display font-bold text-lg">{editing.id ? "Modifier l'encart" : 'Nouvel encart'}</h2>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Emplacement *</span>
              <select value={editing.slotId} onChange={e => setEditing(p => ({ ...p!, slotId: e.target.value as AdSlotId }))}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm bg-white">
                {AD_SLOTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>

            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Titre (usage interne) *</span>
                <input value={editing.title} onChange={e => setEditing(p => ({ ...p!, title: e.target.value }))}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Annonceur affiché</span>
                <input value={editing.sponsorName} onChange={e => setEditing(p => ({ ...p!, sponsorName: e.target.value }))}
                  placeholder="Ex : Orange CI"
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm" />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">URL de l'image *</span>
              <input value={editing.imageUrl} onChange={e => setEditing(p => ({ ...p!, imageUrl: e.target.value }))}
                placeholder="https://…"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm" />
              {editing.imageUrl && (
                <img src={editing.imageUrl} alt="Aperçu" className="mt-2 h-24 rounded-xl object-cover border border-gray-100" />
              )}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Lien de destination *</span>
              <input value={editing.linkUrl} onChange={e => setEditing(p => ({ ...p!, linkUrl: e.target.value }))}
                placeholder="https://…"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm" />
            </label>

            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Début d'affichage (optionnel)</span>
                <input type="date" value={editing.startDate} onChange={e => setEditing(p => ({ ...p!, startDate: e.target.value }))}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Fin d'affichage (optionnel)</span>
                <input type="date" value={editing.endDate} onChange={e => setEditing(p => ({ ...p!, endDate: e.target.value }))}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm" />
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={editing.isActive}
                onChange={e => setEditing(p => ({ ...p!, isActive: e.target.checked }))}
                className="w-4 h-4 accent-solar" />
              Encart actif (visible sur le site)
            </label>

            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving}
                className="bg-solar text-white font-medium px-6 py-2.5 rounded-2xl hover:bg-orange-600 transition text-sm disabled:opacity-50">
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button onClick={() => setEditing(null)}
                className="bg-gray-100 text-gray-600 font-medium px-6 py-2.5 rounded-2xl hover:bg-gray-200 transition text-sm">
                Annuler
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 text-sm">Chargement…</p>
        ) : ads.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun encart créé.</p>
        ) : (
          <div className="space-y-3">
            {ads.map(a => (
              <div key={a.id} className="bg-white rounded-3xl shadow-card px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {a.imageUrl && <img src={a.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />}
                  <div className="min-w-0">
                    <p className="font-display font-bold text-anthracite truncate">{a.title}</p>
                    <p className="text-xs text-gray-400 truncate">{slotLabel(a.slotId)}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <BarChart3 size={11} aria-hidden /> {a.views} vues · {a.clicks} clics
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleActive(a)}
                    className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 transition ${
                      a.isActive ? 'bg-tropical/10 text-tropical' : 'bg-gray-100 text-gray-500'}`}>
                    {a.isActive ? <Eye size={11} aria-hidden /> : <EyeOff size={11} aria-hidden />}
                    {a.isActive ? 'Actif' : 'Inactif'}
                  </button>
                  <button onClick={() => { setEditing({ ...a }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    aria-label={`Modifier ${a.title}`}
                    className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-solar hover:text-white transition">
                    <Pencil size={14} aria-hidden />
                  </button>
                  <button onClick={() => handleDelete(a)} aria-label={`Supprimer ${a.title}`}
                    className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white transition">
                    <Trash2 size={14} aria-hidden />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
