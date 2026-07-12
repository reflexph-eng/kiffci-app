import type { Metadata } from 'next';
import { getEstablishmentById } from '@/lib/partner-firestore';
import EstablishmentDetailClient from './EstablishmentDetailClient';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await getEstablishmentById(id).catch(() => null);
  if (!item || item.status !== 'approved') return { title: 'Créateur introuvable' };

  const description = item.description.length > 155 ? item.description.slice(0, 152) + '…' : item.description;
  const image = item.images[0];

  return {
    title: item.name,
    description,
    openGraph: {
      title: item.name,
      description,
      type: 'article',
      images: image ? [{ url: image, width: 1200, height: 630, alt: item.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: item.name,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default function Page() {
  return <EstablishmentDetailClient />;
}
