import type { Metadata } from 'next';
import { getExperienceById } from '@/lib/firestore';
import ExperienceDetailClient from './ExperienceDetailClient';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const exp = await getExperienceById(id).catch(() => null);
  if (!exp) return { title: 'Expérience introuvable' };

  const description = exp.description.length > 155 ? exp.description.slice(0, 152) + '…' : exp.description;
  const image = exp.images[0];

  return {
    title: exp.title,
    description,
    openGraph: {
      title: exp.title,
      description,
      type: 'article',
      images: image ? [{ url: image, width: 1200, height: 630, alt: exp.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: exp.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default function Page() {
  return <ExperienceDetailClient />;
}
