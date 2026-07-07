import type { Metadata } from 'next';
import { getEventById } from '@/lib/partner-firestore';
import EventDetailClient from './EventDetailClient';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await getEventById(id).catch(() => null);
  if (!item || item.status !== 'approved') return { title: 'Événement introuvable' };

  const description = item.description.length > 155 ? item.description.slice(0, 152) + '…' : item.description;
  const image = item.images[0];

  return {
    title: item.title,
    description,
    openGraph: {
      title: item.title,
      description,
      type: 'article',
      images: image ? [{ url: image, width: 1200, height: 630, alt: item.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default function Page() {
  return <EventDetailClient />;
}
