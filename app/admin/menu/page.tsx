'use client';
/** /admin/menu — menu de navigation éditable (Sprint 2). */
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { getNavItems, saveNavItems, DEFAULT_NAV_ITEMS } from '@/lib/nav-firestore';
import { NavItem } from '@/types';
import { Menu as MenuIcon, Eye, EyeOff, Check } from 'lucide-react';

export default function AdminMenuPage() {
  const [items, setItems]   = useState<NavItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  useEffect(() => { getNavItems().then(setItems); }, []);

  function move(index: number, dir: -1 | 1) {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next.map((it, i) => ({ ...it, order: i + 1 })));
  }

  function toggle(id: string) {
    setItems(items.map(it => it.id === id ? { ...it, isVisible: !it.isVisible } : it));
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
      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="font-display font-bold text-3xl text-anthracite flex items-center gap-2 mb-2">
          <MenuIcon className="text-solar" aria-hidden /> Menu de navigation
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Réorganisez, renommez ou masquez les entrées du menu public. Les pages Passeport, Favoris
          et Profil restent gérées séparément (visibles uniquement une fois connecté).
        </p>

        {items.length === 0 ? (
          <p className="text-gray-400 text-sm">Chargement…</p>
        ) : (
          <div className="bg-white rounded-4xl shadow-card p-6 space-y-2">
            {items.map((item, i) => (
              <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-gray-50">
                <div className="flex flex-col shrink-0">
                  <button onClick={() => move(i, -1)} disabled={i === 0}
                    className="text-[10px] text-gray-400 hover:text-solar disabled:opacity-20" aria-label="Monter">▲</button>
                  <button onClick={() => move(i, 1)} disabled={i === items.length - 1}
                    className="text-[10px] text-gray-400 hover:text-solar disabled:opacity-20" aria-label="Descendre">▼</button>
                </div>
                <input value={item.label} onChange={e => rename(item.id, e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm font-medium" />
                <span className="text-xs text-gray-400 font-mono shrink-0 hidden sm:inline">{item.href}</span>
                <button onClick={() => toggle(item.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shrink-0 transition ${
                    item.isVisible ? 'bg-tropical/10 text-tropical' : 'bg-gray-100 text-gray-500'}`}>
                  {item.isVisible ? <Eye size={12} aria-hidden /> : <EyeOff size={12} aria-hidden />}
                  {item.isVisible ? 'Visible' : 'Masqué'}
                </button>
              </div>
            ))}

            <div className="flex items-center gap-3 pt-4">
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
