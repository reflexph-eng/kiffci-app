'use client';
/** /admin/pages — gestion des pages éditables (Sprint 1). */
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import {
  getAllPagesAdmin, createPage, updatePage, deletePage, DEFAULT_PAGES,
} from '@/lib/pages-firestore';
import { SitePage } from '@/types';
import { Plus, Pencil, Trash2, Eye, EyeOff, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';

type Editing = (Omit<SitePage, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) | null;

const EMPTY: NonNullable<Editing> = {
  slug: '', title: '', content: '', isPublished: false, showInFooter: false, order: 0,
};

export default function AdminPagesPage() {
  const [pages, setPages]     = useState<SitePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Editing>(null);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  async function refresh() {
    setPages(await getAllPagesAdmin());
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  function slugify(s: string) {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  async function handleSave() {
    if (!editing) return;
    if (!editing.title.trim()) { setError('Le titre est requis.'); return; }
    const slug = editing.slug.trim() || slugify(editing.title);
    const conflict = pages.find(p => p.slug === slug && p.id !== editing.id);
    if (conflict) { setError(`Le slug « ${slug} » est déjà utilisé par « ${conflict.title} ».`); return; }
    setSaving(true); setError('');
    try {
      const data = { ...editing, slug };
      if (editing.id) {
        const { id, ...rest } = data;
        await updatePage(id!, rest);
      } else {
        await createPage(data);
      }
      setEditing(null);
      await refresh();
    } catch {
      setError('Enregistrement impossible. Réessaie.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: SitePage) {
    if (!confirm(`Supprimer la page « ${p.title} » ? Cette action est définitive.`)) return;
    await deletePage(p.id);
    await refresh();
  }

  async function handleSeed() {
    if (!confirm('Créer les 4 pages par défaut (À propos, CGU, Confidentialité, Mentions légales) ?')) return;
    setSaving(true);
    const existing = new Set(pages.map(p => p.slug));
    for (const p of DEFAULT_PAGES) {
      if (!existing.has(p.slug)) await createPage(p);
    }
    setSaving(false);
    await refresh();
  }

  return (
    <AuthGuard adminOnly>
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-anthracite flex items-center gap-2">
              <FileText className="text-solar" aria-hidden /> Pages du site
            </h1>
            <p className="text-gray-500 text-sm mt-1">À propos, CGU, FAQ… créez et modifiez vos pages sans coder.</p>
          </div>
          <div className="flex gap-2">
            {pages.length === 0 && !loading && (
              <button onClick={handleSeed} disabled={saving}
                className="flex items-center gap-2 bg-tropical text-white font-medium px-4 py-2.5 rounded-2xl hover:opacity-90 transition text-sm">
                <Sparkles size={15} aria-hidden /> Créer les pages par défaut
              </button>
            )}
            <button onClick={() => { setEditing({ ...EMPTY, order: pages.length + 1 }); setError(''); }}
              className="flex items-center gap-2 bg-solar text-white font-medium px-4 py-2.5 rounded-2xl hover:bg-orange-600 transition text-sm">
              <Plus size={15} aria-hidden /> Nouvelle page
            </button>
          </div>
        </div>

        {/* Formulaire */}
        {editing && (
          <div className="bg-white rounded-4xl shadow-card p-6 mb-8">
            <h2 className="font-display font-bold text-lg mb-4">{editing.id ? 'Modifier la page' : 'Nouvelle page'}</h2>
            {error && <p className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Titre *</span>
                <input value={editing.title}
                  onChange={e => setEditing(p => ({ ...p!, title: e.target.value }))}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Slug (URL : /p/…)</span>
                <input value={editing.slug} placeholder="généré depuis le titre si vide"
                  onChange={e => setEditing(p => ({ ...p!, slug: e.target.value }))}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm font-mono" />
              </label>
            </div>
            <label className="block mb-4">
              <span className="text-sm font-medium text-gray-700">Contenu</span>
              <span className="block text-xs text-gray-400 mb-1">
                Mise en forme : # Titre, ## Sous-titre, **gras**, *italique*, - liste
              </span>
              <textarea value={editing.content} rows={14}
                onChange={e => setEditing(p => ({ ...p!, content: e.target.value }))}
                className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm font-mono leading-relaxed" />
            </label>
            <div className="flex flex-wrap items-center gap-6 mb-6">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={editing.isPublished}
                  onChange={e => setEditing(p => ({ ...p!, isPublished: e.target.checked }))}
                  className="w-4 h-4 accent-solar" />
                Publiée
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={editing.showInFooter}
                  onChange={e => setEditing(p => ({ ...p!, showInFooter: e.target.checked }))}
                  className="w-4 h-4 accent-solar" />
                Afficher dans le footer
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                Ordre
                <input type="number" value={editing.order}
                  onChange={e => setEditing(p => ({ ...p!, order: Number(e.target.value) }))}
                  className="w-20 px-3 py-1.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm" />
              </label>
            </div>
            <div className="flex gap-3">
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

        {/* Liste */}
        {loading ? (
          <p className="text-gray-400 text-sm">Chargement…</p>
        ) : pages.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucune page. Créez les pages par défaut pour démarrer.</p>
        ) : (
          <div className="space-y-3">
            {pages.map(p => (
              <div key={p.id} className="bg-white rounded-3xl shadow-card px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-display font-bold text-anthracite truncate">{p.title}</p>
                  <p className="text-xs text-gray-400 font-mono">/p/{p.slug}
                    {p.showInFooter && <span className="ml-2 text-lagoon font-sans">· footer</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                    p.isPublished ? 'bg-tropical/10 text-tropical' : 'bg-gray-100 text-gray-500'}`}>
                    {p.isPublished ? <Eye size={11} aria-hidden /> : <EyeOff size={11} aria-hidden />}
                    {p.isPublished ? 'Publiée' : 'Brouillon'}
                  </span>
                  {p.isPublished && (
                    <Link href={`/p/${p.slug}`} target="_blank"
                      className="text-xs text-gray-400 hover:text-solar transition underline">Voir</Link>
                  )}
                  <button onClick={() => { setEditing({ ...p }); setError(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    aria-label={`Modifier ${p.title}`}
                    className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-solar hover:text-white transition">
                    <Pencil size={14} aria-hidden />
                  </button>
                  <button onClick={() => handleDelete(p)}
                    aria-label={`Supprimer ${p.title}`}
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
