'use client';
import AuthGuard from '@/components/AuthGuard';
import SuspendedBanner from '@/components/SuspendedBanner';
import { useAuth } from '@/context/AuthContext';
import { levelFromPoints } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function ProfileContent() {
  const { appUser, signOut } = useAuth();
  const router = useRouter();

  if (!appUser) return null;

  const { level, progress } = levelFromPoints(appUser.points);

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  return (
    <div className="grid md:grid-cols-[auto_1fr] gap-8">
      <div className="bg-white rounded-4xl shadow-card p-8 text-center w-full md:w-72">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-solar to-tropical mx-auto flex items-center justify-center text-4xl font-display font-bold text-white">
          {appUser.displayName?.[0]?.toUpperCase() ?? '?'}
        </div>
        <h2 className="font-display font-bold text-xl mt-4">{appUser.displayName}</h2>
        <p className="text-sm text-gray-500 mt-1">{appUser.email}</p>
        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
          appUser.role === 'admin' ? 'bg-solar/10 text-solar' : 'bg-gray-100 text-gray-600'
        }`}>{appUser.role === 'admin' ? '⚡ Admin' : '👤 Utilisateur'}</span>

        {/* Level progress */}
        <div className="mt-6 text-left">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span className="font-semibold">{level}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-solar rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <button onClick={handleSignOut}
          className="mt-6 w-full border border-gray-200 rounded-2xl py-3 font-bold text-gray-700 hover:bg-gray-50 transition text-sm">
          Se déconnecter
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: appUser.points.toLocaleString('fr-FR'), label: 'Points',       color: 'text-solar' },
            { value: appUser.badges?.length ?? 0,            label: 'Badges',        color: 'text-purple-500' },
            { value: level,                                   label: 'Niveau',        color: 'text-tropical' },
          ].map(({ value, label, color }) => (
            <div key={label} className="bg-white rounded-3xl shadow-card p-5 text-center">
              <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-4xl shadow-card p-6">
          <h3 className="font-display font-bold text-lg mb-4">Accès rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/passport',    label: '🎒 Mon passeport' },
              { href: '/favorites',   label: '❤️ Mes favoris' },
              { href: '/challenges',  label: '🏆 Mes défis' },
              { href: '/experiences', label: '🌍 Explorer' },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="border border-gray-100 rounded-2xl p-3 text-sm font-medium hover:bg-solar/5 hover:border-solar/30 hover:text-solar transition">
                {label}
              </Link>
            ))}
          </div>
        </div>

        {appUser.role === 'admin' && (
          <div className="bg-solar/5 border border-solar/20 rounded-3xl p-5">
            <p className="font-semibold text-solar mb-2">⚡ Accès administrateur</p>
            <Link href="/admin" className="text-sm text-solar hover:underline">→ Ouvrir le dashboard admin</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <SuspendedBanner />
      <h1 className="font-display font-bold text-4xl text-anthracite mb-8">Mon profil</h1>
      <AuthGuard>
        <ProfileContent />
      </AuthGuard>
    </main>
  );
}
