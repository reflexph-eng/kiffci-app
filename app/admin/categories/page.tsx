'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { getCategories, createCategory, updateCategory, deleteCategory, toggleCategory } from '@/lib/cms-firestore';
import { Category } from '@/types';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Check, ArrowUp, ArrowDown, Database, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { EXPERIENCE_CATEGORY_SEEDS } from '@/data/experience-categories';

const ICONS = ['🌿','🎭','🍜','🌙','⚡','💆','🧭','🎨','🏊','🎵','🎪','🛍️','🏖️','🎯','🏆','🌊','🦁','🎸'];
const COLORS = ['#F97316','#10B981','#8B5CF6','#EF4444','#06B6D4','#F59E0B','#EC4899','#1F2937','#3B82F6','#84CC16'];

const EMPTY: Omit<Category, 'id' | 'createdAt'> = {
  name: '', icon: '🌿', color: '#F97316', type: 'experience', isVisible: true, order: 1,
};

function CategoriesContent() {
  const [cats,    setCats]    = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState('');
  const [editing, setEditing] = useState<(Omit<Category, 'id' | 'createdAt'> & { id?: string }) | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function load() { setCats(await getCategories()); }

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  async function save() {
    if (!editing?.name) { showToast('Nom requis.'); return; }
    setSaving(true);
    try {
      if (editing.id) {
        const { id, ...data } = editing as Category;
        await updateCategory(id, data);
        showToast('Catégorie mise à jour ✓');
      } else {
        await createCategory(editing as Omit<Category, 'id' | 'createdAt'>);
        showToast('Catégorie créée ✓');
      }
      setEditing(null); load();
    } catch { showToast('Erreur.'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    await deleteCategory(id);
    setConfirm(null); showToast('Catégorie supprimée'); load();
  }

  async function handleToggle(id: string, current: boolean) {
    await toggleCategory(id, !current); load();
  }

  async function moveOrder(cat: Category, dir: 'up' | 'down') {
    const newOrder = dir === 'up' ? cat.order - 1 : cat.order + 1;
    await updateCategory(cat.id, { order: newOrder }); load();
  }

  async function injectExperienceCategories() {
    setSaving(true);
    try {
      const existing = new Set(cats.map(c => c.name.trim().toLowerCase()));
      const missing = EXPERIENCE_CATEGORY_SEEDS.filter(c => !existing.has(c.name.toLowerCase()));
      for (const category of missing) await createCategory(category);
      showToast(missing.length ? `${missing.length} catégories KIFFCI ajoutées ✓` : 'Toutes les catégories sont déjà présentes.');
      await load();
    } catch {
      showToast('Impossible d’injecter les catégories.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex justify-center mt-20"><div className="w-10 h-10 border-4 border-solar border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      {toast && <div className="fixed top-20 right-4 z-50 bg-anthracite text-white px-5 py-3 rounded-2xl shadow-soft font-semibold animate-fadeUp">{toast}</div>}

      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-4xl text-anthracite">Catégories</h1>
          <p className="text-gray-500 mt-1">{cats.filter(c => c.isVisible).length} visibles · {cats.length} total</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/category-proposals" className="border border-gray-200 bg-white px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:border-solar hover:text-solar transition"><Lightbulb size={16}/> Propositions créateurs</Link>
          <button onClick={injectExperienceCategories} disabled={saving}
            className="border border-gray-200 bg-white px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:border-solar hover:text-solar transition disabled:opacity-50">
            <Database size={16} /> Injecter les catégories KIFFCI
          </button>
          <button onClick={() => setEditing({ ...EMPTY, order: cats.length + 1 })}
            className="bg-solar text-white px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-orange-600 transition">
            <Plus size={16} /> Nouvelle catégorie
          </button>
        </div>
      </div>

      {/* Form */}
      {editing && (
        <div className="bg-white rounded-4xl shadow-soft p-6 mb-8 border-2 border-solar/20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-2xl">{editing.id ? 'Modifier' : 'Nouvelle'} catégorie</h2>
            <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Nom *</label>
                <input type="text" value={editing.name} onChange={e => setEditing(p => ({ ...p!, name: e.target.value }))}
                  placeholder="Ex: Nature"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Type</label>
                <select value={editing.type} onChange={e => setEditing(p => ({ ...p!, type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-solar/30">
                  <option value="experience">Expérience</option>
                  <option value="establishment">Établissement</option>
                  <option value="event">Événement</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Ordre</label>
                  <input type="number" min={1} value={editing.order}
                    onChange={e => setEditing(p => ({ ...p!, order: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editing.isVisible}
                      onChange={e => setEditing(p => ({ ...p!, isVisible: e.target.checked }))}
                      className="rounded accent-orange-500 w-4 h-4" />
                    <span className="text-sm font-medium">Visible</span>
                  </label>
                </div>
              </div>
              {/* Aperçu */}
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: editing.color + '20' }}>
                  {editing.icon}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: editing.color }}>{editing.name || 'Aperçu'}</p>
                  <p className="text-xs text-gray-400">{editing.type}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Icône</label>
                <div className="grid grid-cols-9 gap-1.5">
                  {ICONS.map(icon => (
                    <button key={icon} type="button" onClick={() => setEditing(p => ({ ...p!, icon }))}
                      className={`h-9 rounded-xl text-lg transition ${editing.icon === icon ? 'bg-solar/20 ring-2 ring-solar' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Couleur</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(color => (
                    <button key={color} type="button" onClick={() => setEditing(p => ({ ...p!, color }))}
                      className={`w-8 h-8 rounded-full transition ${editing.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                      style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
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
      <div className="bg-white rounded-4xl shadow-card overflow-hidden">
        {cats.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🏷️</p>
            <h3 className="font-display font-bold text-xl">Aucune catégorie</h3>
          </div>
        ) : (
          <div className="divide-y">
            {cats.map((cat, idx) => (
              <div key={cat.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveOrder(cat, 'up')} disabled={idx === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-20"><ArrowUp size={12} /></button>
                  <button onClick={() => moveOrder(cat, 'down')} disabled={idx === cats.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-20"><ArrowDown size={12} /></button>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: cat.color + '20' }}>
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: cat.color }}>{cat.name}</p>
                  <p className="text-xs text-gray-400">{cat.type} · ordre {cat.order}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${cat.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  {cat.isVisible ? 'Visible' : 'Cachée'}
                </span>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => setEditing(cat)} className="p-2 rounded-xl text-gray-400 hover:bg-solar/10 hover:text-solar transition"><Edit2 size={14} /></button>
                  <button onClick={() => handleToggle(cat.id, cat.isVisible)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition">
                    {cat.isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  {confirm === cat.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(cat.id)} className="px-2 py-1 bg-red-600 text-white rounded-xl text-xs font-bold">Oui</button>
                      <button onClick={() => setConfirm(null)} className="px-2 py-1 bg-gray-100 rounded-xl text-xs">Non</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirm(cat.id)} className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition"><Trash2 size={14} /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <AuthGuard adminOnly><CategoriesContent /></AuthGuard>
    </main>
  );
}
