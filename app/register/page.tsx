'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const { signUp, signInGoogle } = useAuth();
  const router = useRouter();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError('Le mot de passe doit faire au moins 6 caractères.'); return; }
    setError(''); setLoading(true);
    try {
      await signUp(email, password, name);
      router.replace('/');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      if (code.includes('email-already-in-use'))
        setError('Cet email est déjà utilisé.');
      else setError("Erreur lors de l'inscription. Réessaie.");
    } finally { setLoading(false); }
  }

  async function handleGoogle() {
    setError(''); setLoading(true);
    try { await signInGoogle(); router.replace('/'); }
    catch { setError('Connexion Google annulée.'); }
    finally { setLoading(false); }
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-solar rounded-2xl mb-4">
            <UserPlus size={26} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl">Créer un compte</h1>
          <p className="text-gray-500 mt-1">Rejoins la communauté KIFFCI</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-4xl shadow-card p-8 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Prénom / Pseudo</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar"
              placeholder="Kofi" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar"
              placeholder="toi@exemple.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Mot de passe</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} required autoComplete="new-password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar"
                placeholder="6 caractères minimum" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-solar text-white rounded-2xl py-3 font-bold hover:bg-orange-600 transition disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Créer mon compte"}
          </button>
          <div className="relative flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400">ou</span><div className="flex-1 h-px bg-gray-200" />
          </div>
          <button type="button" onClick={handleGoogle} disabled={loading}
            className="w-full border border-gray-200 rounded-2xl py-3 font-bold text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2 disabled:opacity-60">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-500">
          Déjà un compte ? <Link href="/login" className="text-solar font-semibold hover:underline">Se connecter</Link>
        </p>
      </div>
    </main>
  );
}
