'use client';
/** /admin/sections — rubriques dynamiques de la homepage (Sprint 2). */
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import ContentPicker from '@/components/ContentPicker';
import {
  getAllSectionsAdmin, createSection, updateSection, deleteSection,
} from '@/lib/sections-firestore';
import { HomeSection, SectionContentType } from '@/types';
import { Plus, Pencil, Trash2, LayoutGrid, Eye, EyeOff } from 'lucide-react';

type Editing = (Omit<HomeSection, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) | null;

const EMPTY: NonNullable<Editing> = {
  title: '', subtitle: '', contentType: 'experiences', mode: 'manual',
  manualIds: [], autoCategory: '', autoMood: '', autoCity: '', autoPriceMax: 0,
  limit: 6, isActive: true, order: 0,
};

const CONTENT_LABELS: Record<SectionContentType, string> = {
  experiences: 'Expériences', establishments: 'Établissements', events: 'Événements',
};

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState<Editing>(null);
  const [saving, setSaving]     = useState(false);

  async function refresh() {
    setSections(await getAllSectionsAdmin());
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function handleSave() {
    if (!editing || !editing.title.trim()) return;
    setSaving(true);
    try {
      if (editing.id) {
        const { id, ...rest } = editing;
        await updateSection(id!, rest);
      } else {
        await createSection({ ...editing, order: sections.length + 1 });
      }
      setEditing(null);
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(s: HomeSection) {
    if (!confirm(`Supprimer la rubrique « ${s.title} » ?`)) return;
    await deleteSection(s.id);
    await refresh();
  }

  async function toggleActive(s: HomeSection) {
    await updateSection(s.id, { isActive: !s.isActive });
    await refresh();
  }

  return (
    <AuthGuard adminOnly>
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-anthracite flex items-center gap-2">
              <LayoutGrid className="text-solar" aria-hidden /> Rubriques de la homepage
            </h1>
            <p className="text-gray-500 text-sm mt-1">Créez des sections thématiques : "Spécial vacances", "Kiffs à moins de 5 000 F"…</p>
          </div>
          <button onClick={() => setEditing({ ...EMPTY })}
            className="flex items-center gap-2 bg-solar text-white font-medium px-4 py-2.5 rounded-2xl hover:bg-orange-600 transition text-sm">
            <Plus size={15} aria-hidden /> Nouvelle rubrique
          </button>
        </div>

        {editing && (
          <div className="bg-white rounded-4xl shadow-card p-6 mb-8 space-y-4">
            <h2 className="font-display font-bold text-lg">{editing.id ? 'Modifier la rubrique' : 'Nouvelle rubrique'}</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Titre *</span>
                <input value={editing.title} onChange={e => setEditing(p => ({ ...p!, title: e.target.value }))}
                  placeholder="Ex : Spécial vacances scolaires"
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Sous-titre</span>
                <input value={editing.subtitle} onChange={e => setEditing(p => ({ ...p!, subtitle: e.target.value }))}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm" />
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Type de contenu</span>
                <select value={editing.contentType}
                  onChange={e => setEditing(p => ({ ...p!, contentType: e.target.value as SectionContentType, manualIds: [] }))}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm bg-white">
                  {Object.entries(CONTENT_LABELS).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Mode de sélection</span>
                <select value={editing.mode}
                  onChange={e => setEditing(p => ({ ...p!, mode: e.target.value as HomeSection['mode'] }))}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm bg-white">
                  <option value="manual">Sélection manuelle</option>
                  <option value="auto">Règle automatique</option>
                </select>
              </label>
            </div>

            {editing.mode === 'manual' ? (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-2">Contenus sélectionnés</span>
                <ContentPicker contentType={editing.contentType} selectedIds={editing.manualIds}
                  onChange={ids => setEditing(p => ({ ...p!, manualIds: ids }))} />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-4">
                <label className="block">
                  <span className="text-xs font-medium text-gray-600">Catégorie (vide = toutes)</span>
                  <input value={editing.autoCategory} onChange={e => setEditing(p => ({ ...p!, autoCategory: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm" />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-gray-600">Ville (vide = toutes)</span>
                  <input value={editing.autoCity} onChange={e => setEditing(p => ({ ...p!, autoCity: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm" />
                </label>
                {editing.contentType === 'experiences' && (
                  <label className="block">
                    <span className="text-xs font-medium text-gray-600">Mood (vide = tous)</span>
                    <input value={editing.autoMood} onChange={e => setEditing(p => ({ ...p!, autoMood: e.target.value }))}
                      placeholder="ex: nature, romantique…"
                      className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm" />
                  </label>
                )}
                <label className="block">
                  <span className="text-xs font-medium text-gray-600">Prix maximum (0 = illimité)</span>
                  <input type="number" value={editing.autoPriceMax}
                    onChange={e => setEditing(p => ({ ...p!, autoPriceMax: Number(e.target.value) }))}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm" />
                </label>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                Nombre d'éléments affichés
                <input type="number" min={1} max={12} value={editing.limit}
                  onChange={e => setEditing(p => ({ ...p!, limit: Number(e.target.value) }))}
                  className="w-20 px-3 py-1.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm" />
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={editing.isActive}
                  onChange={e => setEditing(p => ({ ...p!, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-solar" />
                Rubrique active
              </label>
            </div>

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
        ) : sections.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucune rubrique. Créez-en une pour animer votre homepage.</p>
        ) : (
          <div className="space-y-3">
            {sections.map(s => (
              <div key={s.id} className="bg-white rounded-3xl shadow-card px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-display font-bold text-anthracite truncate">{s.title}</p>
                  <p className="text-xs text-gray-400">
                    {CONTENT_LABELS[s.contentType]} · {s.mode === 'manual' ? `${s.manualIds.length} sélectionné(s)` : 'règle automatique'} · {s.limit} affichés
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleActive(s)}
                    className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 transition ${
                      s.isActive ? 'bg-tropical/10 text-tropical' : 'bg-gray-100 text-gray-500'}`}>
                    {s.isActive ? <Eye size={11} aria-hidden /> : <EyeOff size={11} aria-hidden />}
                    {s.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button onClick={() => { setEditing({ ...s }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    aria-label={`Modifier ${s.title}`}
                    className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-solar hover:text-white transition">
                    <Pencil size={14} aria-hidden />
                  </button>
                  <button onClick={() => handleDelete(s)} aria-label={`Supprimer ${s.title}`}
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
