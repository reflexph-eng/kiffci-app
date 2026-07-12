'use client';
import { ChangeEvent, useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import SuspendedBanner from '@/components/SuspendedBanner';
import { useAuth } from '@/context/AuthContext';
import { levelFromPoints } from '@/lib/utils';
import { uploadAvatar, validateAvatarFile } from '@/lib/storage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, Check, Pencil, X } from 'lucide-react';

function ProfileContent() {
  const { appUser, firebaseUser, signOut, saveProfile } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!appUser) return;
    setFirstName(appUser.firstName ?? '');
    setLastName(appUser.lastName ?? '');
    setUsername(appUser.username ?? appUser.displayName ?? '');
    setAvatarPreview(appUser.photoURL ?? '');
  }, [appUser]);

  if (!appUser || !firebaseUser) return null;
  const currentUser = appUser;
  const currentFirebaseUser = firebaseUser;
  const { level, progress } = levelFromPoints(currentUser.points);
  const publicName = currentUser.username || currentUser.displayName || currentUser.firstName || 'Utilisateur KIFFCI';

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const validationError = validateAvatarFile(file);
    if (validationError) { setError(validationError); return; }
    setError('');
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function cancelEdit() {
    setEditing(false);
    setError('');
    setMessage('');
    setAvatarFile(null);
    setFirstName(currentUser.firstName ?? '');
    setLastName(currentUser.lastName ?? '');
    setUsername(currentUser.username ?? currentUser.displayName ?? '');
    setAvatarPreview(currentUser.photoURL ?? '');
  }

  async function handleSave() {
    if (!firstName.trim()) { setError('Renseigne ton prénom.'); return; }
    if (username.trim().length < 3) { setError('Le pseudo doit contenir au moins 3 caractères.'); return; }
    setSaving(true); setError(''); setMessage('');
    let photoURL = currentUser.photoURL;
    let avatarWarning = '';
    if (avatarFile) {
      try { photoURL = await uploadAvatar(currentFirebaseUser.uid, avatarFile); }
      catch (uploadError) {
        console.error('[Profil] Upload avatar impossible :', uploadError);
        avatarWarning = ' Tes informations sont enregistrées, mais la photo sera activée dès que Firebase Storage sera disponible.';
      }
    }
    try {
      await saveProfile({ firstName: firstName.trim(), lastName: lastName.trim(), username: username.trim(), photoURL });
      setEditing(false); setAvatarFile(null);
      setMessage(`Profil mis à jour.${avatarWarning}`);
    } catch (saveError) {
      console.error('[Profil] Mise à jour impossible :', saveError);
      setError('Impossible d’enregistrer le profil. Réessaie.');
    } finally { setSaving(false); }
  }

  return (
    <div className="grid md:grid-cols-[auto_1fr] gap-8">
      <div className="bg-white rounded-4xl shadow-card p-8 text-center w-full md:w-72">
        <div className="relative w-24 h-24 mx-auto">
          {avatarPreview ? (
            <img src={avatarPreview} alt={`Photo de ${publicName}`} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-card" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-solar to-tropical flex items-center justify-center text-4xl font-display font-bold text-white">{publicName[0]?.toUpperCase() ?? '?'}</div>
          )}
          {editing && (
            <label className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-anthracite text-white flex items-center justify-center cursor-pointer shadow-card hover:bg-solar transition" aria-label="Choisir une photo de profil">
              <Camera size={16} /><input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
            </label>
          )}
        </div>
        <h2 className="font-display font-bold text-xl mt-4">@{publicName}</h2>
        {(currentUser.firstName || currentUser.lastName) && <p className="text-sm text-gray-600 mt-1">{[currentUser.firstName, currentUser.lastName].filter(Boolean).join(' ')}</p>}
        <p className="text-sm text-gray-500 mt-1 break-all">{currentUser.email}</p>
        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${(currentUser.role === 'admin' || currentUser.role === 'super_admin') ? 'bg-solar/10 text-solar' : currentUser.role === 'partner' ? 'bg-tropical/10 text-tropical' : 'bg-gray-100 text-gray-600'}`}>{(currentUser.role === 'admin' || currentUser.role === 'super_admin') ? '⚡ Admin' : currentUser.role === 'partner' ? '🚀 Créateur' : '👤 Utilisateur'}</span>
        <div className="mt-6 text-left"><div className="flex justify-between text-xs text-gray-500 mb-1"><span className="font-semibold">{level}</span><span>{progress}%</span></div><div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-solar rounded-full" style={{ width: `${progress}%` }} /></div></div>
        <button onClick={handleSignOut} className="mt-6 w-full border border-gray-200 rounded-2xl py-3 font-bold text-gray-700 hover:bg-gray-50 transition text-sm">Se déconnecter</button>
      </div>

      <div className="space-y-4">
        {message && <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl px-4 py-3 text-sm">{message}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">{error}</div>}
        <div className="bg-white rounded-4xl shadow-card p-6">
          <div className="flex items-center justify-between gap-4 mb-5"><div><h3 className="font-display font-bold text-lg">Mon identité KIFFCI</h3><p className="text-sm text-gray-500 mt-1">Ton pseudo et ta photo apparaissent dans tes prochains avis.</p></div>{!editing && <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 text-sm font-bold text-solar hover:underline"><Pencil size={15} /> Modifier</button>}</div>
          {editing ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-500 mb-1">Prénom</label><input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar" /></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1">Nom <span className="font-normal">(facultatif)</span></label><input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar" /></div>
              <div className="sm:col-span-2"><label className="block text-xs font-bold text-gray-500 mb-1">Pseudo public</label><input value={username} onChange={e => setUsername(e.target.value.replace(/\s+/g, '').replace(/^@+/, ''))} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar" /><p className="text-xs text-gray-400 mt-1">Au moins 3 caractères, sans espace.</p></div>
              <div className="sm:col-span-2 flex flex-wrap gap-3 pt-2"><button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 bg-solar text-white rounded-2xl px-5 py-3 text-sm font-bold hover:bg-orange-600 transition disabled:opacity-60"><Check size={16} />{saving ? 'Enregistrement…' : 'Enregistrer'}</button><button onClick={cancelEdit} disabled={saving} className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 rounded-2xl px-5 py-3 text-sm font-bold hover:bg-gray-200 transition"><X size={16} /> Annuler</button></div>
            </div>
          ) : (
            <dl className="grid sm:grid-cols-3 gap-4"><div><dt className="text-xs font-bold text-gray-400 uppercase tracking-wide">Prénom</dt><dd className="mt-1 text-sm font-semibold text-anthracite">{currentUser.firstName || 'À compléter'}</dd></div><div><dt className="text-xs font-bold text-gray-400 uppercase tracking-wide">Nom</dt><dd className="mt-1 text-sm font-semibold text-anthracite">{currentUser.lastName || 'Facultatif'}</dd></div><div><dt className="text-xs font-bold text-gray-400 uppercase tracking-wide">Pseudo</dt><dd className="mt-1 text-sm font-semibold text-solar">@{publicName}</dd></div></dl>
          )}
        </div>

        <div className="overflow-hidden rounded-4xl bg-anthracite p-6 text-white shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-solar">Pour les professionnels et passionnés</p>
          <h3 className="mt-2 font-display text-2xl font-bold">{currentUser.role === 'partner' ? 'Ton Espace Créateur est actif' : 'Transforme tes idées en expériences'}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">Crée une vitrine publique, publie tes expériences et développe ta visibilité sur KIFFCI.</p>
          <Link href={currentUser.role === 'partner' ? '/partner/dashboard' : '/creator/onboarding'} className="mt-5 inline-flex items-center rounded-2xl bg-solar px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600">🚀 {currentUser.role === 'partner' ? 'Accéder à mon Espace Créateur' : 'Devenir créateur d’expériences'}</Link>
        </div>

        <div className="grid grid-cols-3 gap-4">{[{ value: currentUser.points.toLocaleString('fr-FR'), label: 'Points', color: 'text-solar' },{ value: currentUser.badges?.length ?? 0, label: 'Badges', color: 'text-purple-500' },{ value: level, label: 'Niveau', color: 'text-tropical' }].map(({ value, label, color }) => <div key={label} className="bg-white rounded-3xl shadow-card p-5 text-center"><p className={`font-display font-bold text-2xl ${color}`}>{value}</p><p className="text-sm text-gray-500 mt-1">{label}</p></div>)}</div>
        <div className="bg-white rounded-4xl shadow-card p-6"><h3 className="font-display font-bold text-lg mb-4">Accès rapides</h3><div className="grid grid-cols-2 gap-3">{[{ href: '/passport', label: '🎒 Mon passeport' },{ href: '/favorites', label: '❤️ Mes favoris' },{ href: '/challenges', label: '🏆 Mes défis' },{ href: '/experiences', label: '🌍 Explorer' }].map(({ href, label }) => <Link key={href} href={href} className="border border-gray-100 rounded-2xl p-3 text-sm font-medium hover:bg-solar/5 hover:border-solar/30 hover:text-solar transition">{label}</Link>)}</div></div>
        {(currentUser.role === 'admin' || currentUser.role === 'super_admin') && <div className="bg-solar/5 border border-solar/20 rounded-3xl p-5"><p className="font-semibold text-solar mb-2">⚡ Accès administrateur</p><Link href="/admin" className="text-sm text-solar hover:underline">→ Ouvrir le dashboard admin</Link></div>}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return <main className="max-w-4xl mx-auto px-4 py-10"><SuspendedBanner /><h1 className="font-display font-bold text-4xl text-anthracite mb-8">Mon profil</h1><AuthGuard><ProfileContent /></AuthGuard></main>;
}
