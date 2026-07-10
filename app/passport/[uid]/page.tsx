import type { Metadata } from 'next';
import { getPublicProfile } from '@/lib/firestore';
import { levelFromPoints } from '@/lib/utils';
import PublicPassportClient from './PublicPassportClient';

type Props = { params: Promise<{ uid: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uid } = await params;
  const profile = await getPublicProfile(uid).catch(() => null);
  if (!profile) return { title: 'Passeport introuvable' };

  const { level } = levelFromPoints(profile.points);
  const title = `${profile.displayName} — Niveau ${level} sur KiffCI`;
  const description = `${profile.experiencesCount} expérience(s) vécue(s), ${profile.points} points. Découvre le passeport KiffCI de ${profile.displayName}.`;

  return {
    title,
    description,
    openGraph: {
      title, description, type: 'profile',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'KiffCI' }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-image.jpg'] },
  };
}

export default async function Page({ params }: Props) {
  const { uid } = await params;
  return <PublicPassportClient uid={uid} />;
}
