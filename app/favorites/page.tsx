'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import ExperienceCard from '@/components/ExperienceCard';
import { getFavoriteExperiences } from '@/lib/firestore';
import { useAuth } from '@/context/AuthContext';
import { Experience } from '@/types';
import Link from 'next/link';

function FavoritesContent() {
  const { appUser } = useAuth();
  const [exps,    setExps]    = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appUser) return;
    getFavoriteExperiences(appUser.uid)
      .then(setExps)
      .finally(() => setLoading(false));
  }, [appUser]);

  if (loading) return (
    <div className="flex justify-center mt-16">
      <div className="w-10 h-10 border-4 border-solar border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      {exps.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          {exps.map((e) => <ExperienceCard key={e.id} e={e} />)}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-4xl shadow-card">
          <p className="text-5xl mb-4">❤️</p>
          <h3 className="font-display font-bold text-xl">Aucun favori pour l'instant</h3>
          <p className="text-gray-500 mt-2">Explore les expériences et sauvegarde tes préférées.</p>
          <Link href="/experiences" className="mt-6 inline-block bg-solar text-white px-6 py-3 rounded-2xl font-bold hover:bg-orange-600 transition">
            Explorer les expériences
          </Link>
        </div>
      )}
    </div>
  );
}

export default function FavoritesPage() {
  const { appUser } = useAuth();
  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-display font-bold text-4xl text-anthracite mb-2">Mes favoris</h1>
      <p className="text-gray-500 mb-8">Tes expériences sauvegardées.</p>
      <AuthGuard>
        <FavoritesContent />
      </AuthGuard>
    </main>
  );
}
