'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const { signUp, signInGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRedirect = searchParams.get('redirect');
  const redirectTo = requestedRedirect?.startsWith('/') && !requestedRedirect.startsWith('//')
    ? requestedRedirect
    : '/profile';
  const [firstName, setFirstName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError('Le mot de passe doit faire au moins 6 caractères.'); return; }
    if (username.trim().length < 3) { setError('Le pseudo doit contenir au moins 3 caractères.'); return; }
    setError(''); setLoading(true);
    try {
      await signUp(email, password, firstName.trim(), username.trim());
      router.replace(redirectTo);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      if (code.includes('email-already-in-use')) setError('Cet email est déjà utilisé.');
      else setError("Erreur lors de l'inscription. Réessaie.");
    } finally { setLoading(false); }
  }

  async function handleGoogle() {
    setError(''); setLoading(true);
    try { await signInGoogle(); router.replace(redirectTo); }
    catch { setError('Connexion Google annulée.'); }
    finally { setLoading(false); }
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-solar rounded-2xl mb-4"><UserPlus size={26} className="text-white" /></div>
          <h1 className="font-display font-bold text-3xl">Créer un compte</h1>
          <p className="text-gray-500 mt-1">Rejoins la communauté KIFFCI</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="bg-white rounded-4xl shadow-card p-8 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Prénom</label>
            <input type="text" required autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar" placeholder="Kofi" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Pseudo public</label>
            <input type="text" required autoComplete="nickname" value={username} onChange={(e) => setUsername(e.target.value.replace(/\s+/g, '').replace(/^@+/, ''))} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar" placeholder="kofi225" />
            <p className="text-xs text-gray-400 mt-1">C’est ce nom qui apparaîtra dans tes avis.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar" placeholder="toi@exemple.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Mot de passe</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-200 rounded-2xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar" placeholder="6 caractères minimum" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-solar text-white rounded-2xl py-3 font-bold hover:bg-orange-600 transition disabled:opacity-60 flex items-center justify-center gap-2">{loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Créer mon compte'}</button>
          <div className="relative flex items-center gap-3 my-2"><div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400">ou</span><div className="flex-1 h-px bg-gray-200" /></div>
          <button type="button" onClick={handleGoogle} disabled={loading} className="w-full border border-gray-200 rounded-2xl py-3 font-bold text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2 disabled:opacity-60">Continuer avec Google</button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-500">Déjà un compte ? <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="text-solar font-semibold hover:underline">Se connecter</Link></p>
      </div>
    </main>
  );
}
