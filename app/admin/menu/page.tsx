'use client';
/** /admin/menu — menu de navigation éditable (Sprint 2, étendu Sprint 11). */
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { getNavItems, saveNavItems, DEFAULT_NAV_ITEMS } from '@/lib/nav-firestore';
import { NavItem } from '@/types';
import { Menu as MenuIcon, Eye, EyeOff, Check, PanelTop, PanelRightOpen } from 'lucide-react';

const SCOPE_LABELS: Record<NavItem['scope'], string> = {
  public: 'Public — visible par tous',
  auth: 'Réservé aux connectés',
  partner: 'Réservé aux annonceurs',
  admin: 'Réservé aux administrateurs',
  moderator: 'Réservé aux modérateurs',
};

const SCOPE_ORDER: NavItem['scope'][] = ['public', 'auth', 'partner', 'admin', 'moderator'];

export default function AdminMenuPage() {
  const [items, setItems]   = useState<NavItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  useEffect(() => { getNavItems().then(setItems); }, []);

  function moveWithinScope(scope: NavItem['scope'], indexInScope: number, dir: -1 | 1) {
    const scoped = items.filter(i => i.scope === scope).sort((a, b) => a.order - b.order);
    const target = indexInScope + dir;
    if (target < 0 || target >= scoped.length) return;
    const a = scoped[indexInScope], b = scoped[target];
    setItems(prev => prev.map(it => {
      if (it.id === a.id) return { ...it, order: b.order };
      if (it.id === b.id) return { ...it, order: a.order };
      return it;
    }));
  }

  function toggleVisible(id: string) {
    setItems(items.map(it => it.id === id ? { ...it, isVisible: !it.isVisible } : it));
  }

  function togglePlacement(id: string) {
    setItems(items.map(it => it.id === id ? { ...it, placement: it.placement === 'bar' ? 'more' : 'bar' } : it));
  }

  function rename(id: string, label: string) {
    setItems(items.map(it => it.id === id ? { ...it, label } : it));
  }

  async function handleSave() {
    setSaving(true); setSaved(false);
    await saveNavItems(items);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleReset() {
    if (!confirm('Réinitialiser le menu aux valeurs par défaut ?')) return;
    setItems(DEFAULT_NAV_ITEMS);
    await saveNavItems(DEFAULT_NAV_ITEMS);
  }

  return (
    <AuthGuard adminOnly>
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="font-display font-bold text-3xl text-anthracite flex items-center gap-2 mb-2">
          <MenuIcon className="text-solar" aria-hidden /> Menu de navigation
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Réorganisez, renommez, masquez, et choisissez si chaque élément apparaît directement dans la barre
          ou dans le menu replié (⋮). La restriction d'accès réelle (connexion, rôle) reste toujours appliquée
          automatiquement, quel que soit votre choix ici.
        </p>

        {items.length === 0 ? (
          <p className="text-gray-400 text-sm">Chargement…</p>
        ) : (
          <div className="space-y-8">
            {SCOPE_ORDER.map(scope => {
              const scoped = items.filter(i => i.scope === scope).sort((a, b) => a.order - b.order);
              if (scoped.length === 0) return null;
              return (
                <div key={scope}>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 px-1">{SCOPE_LABELS[scope]}</p>
                  <div className="bg-white rounded-3xl shadow-card p-4 space-y-2">
                    {scoped.map((item, i) => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-2 py-2.5 rounded-2xl hover:bg-gray-50">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex flex-col shrink-0">
                            <button onClick={() => moveWithinScope(scope, i, -1)} disabled={i === 0}
                              className="text-[10px] text-gray-400 hover:text-solar disabled:opacity-20" aria-label="Monter">▲</button>
                            <button onClick={() => moveWithinScope(scope, i, 1)} disabled={i === scoped.length - 1}
                              className="text-[10px] text-gray-400 hover:text-solar disabled:opacity-20" aria-label="Descendre">▼</button>
                          </div>
                          <input value={item.label} onChange={e => rename(item.id, e.target.value)}
                            className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm font-medium" />
                          <span className="text-xs text-gray-400 font-mono shrink-0 hidden lg:inline">{item.href}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => togglePlacement(item.id)} title="Basculer entre barre horizontale et menu replié"
                            className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition ${
                              item.placement === 'bar' ? 'bg-lagoon/10 text-lagoon' : 'bg-purple-50 text-purple-600'}`}>
                            {item.placement === 'bar' ? <PanelTop size={12} aria-hidden /> : <PanelRightOpen size={12} aria-hidden />}
                            {item.placement === 'bar' ? 'Barre' : 'Repli'}
                          </button>
                          <button onClick={() => toggleVisible(item.id)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition ${
                              item.isVisible ? 'bg-tropical/10 text-tropical' : 'bg-gray-100 text-gray-500'}`}>
                            {item.isVisible ? <Eye size={12} aria-hidden /> : <EyeOff size={12} aria-hidden />}
                            {item.isVisible ? 'Visible' : 'Masqué'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleSave} disabled={saving}
                className="bg-solar text-white font-medium px-6 py-2.5 rounded-2xl hover:bg-orange-600 transition text-sm disabled:opacity-50">
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button onClick={handleReset}
                className="text-sm text-gray-400 hover:text-gray-600 transition">
                Réinitialiser
              </button>
              {saved && <span className="flex items-center gap-1 text-tropical text-sm font-medium"><Check size={15} aria-hidden /> Enregistré</span>}
            </div>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
