'use client';
import dynamic from 'next/dynamic';
import PageHeader from '@/components/PageHeader';
const MapClient = dynamic(() => import('@/components/MapClient'), { ssr: false });
export default function MapPage() {
  return (
    <main>
      <PageHeader
        title="Carte interactive"
        subtitle="Visualise toutes les expériences autour de toi."
        crumbs={[{ label: 'Carte' }]} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <MapClient />
      </div>
    </main>
  );
}
