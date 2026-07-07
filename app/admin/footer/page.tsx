'use client';
/** /admin/footer — réglages du footer : description, contacts, réseaux sociaux (Sprint 1). */
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { getFooterSettings, updateFooterSettings } from '@/lib/pages-firestore';
import { FooterSettings } from '@/types';
import { PanelBottom, Check } from 'lucide-react';

const FIELDS: { key: keyof FooterSettings; label: string; placeholder: string }[] = [
  { key: 'description', label: 'Description (colonne marque)', placeholder: "La plateforme des expériences et loisirs en Côte d'Ivoire." },
  { key: 'email',       label: 'E-mail de contact',            placeholder: 'hello@kiffci.ci' },
  { key: 'phone',       label: 'Téléphone',                    placeholder: '+225 07 00 00 00 00' },
  { key: 'whatsapp',    label: 'WhatsApp (numéro)',            placeholder: '+225 07 00 00 00 00' },
  { key: 'instagram',   label: 'Instagram (URL)',              placeholder: 'https://instagram.com/kiffci' },
  { key: 'tiktok',      label: 'TikTok (URL)',                 placeholder: 'https://tiktok.com/@kiffci' },
  { key: 'facebook',    label: 'Facebook (URL)',               placeholder: 'https://facebook.com/kiffci' },
  { key: 'youtube',     label: 'YouTube (URL)',                placeholder: 'https://youtube.com/@kiffci' },
];

export default function AdminFooterPage() {
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  useEffect(() => { getFooterSettings().then(setSettings); }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true); setSaved(false);
    await updateFooterSettings(settings);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <AuthGuard adminOnly>
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="font-display font-bold text-3xl text-anthracite flex items-center gap-2 mb-2">
          <PanelBottom className="text-solar" aria-hidden /> Footer & réseaux sociaux
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Les champs vides sont automatiquement masqués sur le site — rien ne sera « cassé ».
          Les liens légaux du footer proviennent des <b>Pages du site</b> cochées « Afficher dans le footer ».
        </p>

        {!settings ? (
          <p className="text-gray-400 text-sm">Chargement…</p>
        ) : (
          <div className="bg-white rounded-4xl shadow-card p-6 space-y-4">
            {FIELDS.map(f => (
              <label key={f.key} className="block">
                <span className="text-sm font-medium text-gray-700">{f.label}</span>
                <input
                  value={(settings[f.key] as string) ?? ''}
                  placeholder={f.placeholder}
                  onChange={e => setSettings(s => ({ ...s!, [f.key]: e.target.value }))}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm" />
              </label>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleSave} disabled={saving}
                className="bg-solar text-white font-medium px-6 py-2.5 rounded-2xl hover:bg-orange-600 transition text-sm disabled:opacity-50">
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              {saved && <span className="flex items-center gap-1 text-tropical text-sm font-medium"><Check size={15} aria-hidden /> Enregistré</span>}
            </div>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
