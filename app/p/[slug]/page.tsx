'use client';
/**
 * /p/[slug] — rendu public des pages éditables (Sprint 1).
 */
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { getPublishedPageBySlug } from '@/lib/pages-firestore';
import { SitePage } from '@/types';

/** Rendu markdown simplifié : #/##/### titres, **gras**, *italique*, listes -, paragraphes. */
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('*') && p.endsWith('*'))   return <em key={i}>{p.slice(1, -1)}</em>;
    return p;
  });
}

function MarkdownLite({ content }: { content: string }) {
  const blocks = content.split(/\n\s*\n/);
  return (
    <div className="space-y-5">
      {blocks.map((block, bi) => {
        const lines = block.split('\n').filter(Boolean);
        if (lines.length === 0) return null;
        // Liste
        if (lines.every(l => l.trim().startsWith('- '))) {
          return (
            <ul key={bi} className="list-disc pl-6 space-y-1.5 text-gray-700">
              {lines.map((l, li) => <li key={li}>{renderInline(l.trim().slice(2))}</li>)}
            </ul>
          );
        }
        return lines.map((line, li) => {
          const key = `${bi}-${li}`;
          if (line.startsWith('### ')) return <h3 key={key} className="font-display font-bold text-lg text-anthracite mt-6">{renderInline(line.slice(4))}</h3>;
          if (line.startsWith('## '))  return <h2 key={key} className="font-display font-bold text-2xl text-anthracite mt-8">{renderInline(line.slice(3))}</h2>;
          if (line.startsWith('# '))   return <h2 key={key} className="font-display font-bold text-3xl text-anthracite">{renderInline(line.slice(2))}</h2>;
          return <p key={key} className="text-gray-700 leading-relaxed">{renderInline(line)}</p>;
        });
      })}
    </div>
  );
}

export default function EditablePage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage]       = useState<SitePage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getPublishedPageBySlug(slug)
      .then(setPage)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main>
        <div className="bg-gradient-to-r from-solar via-orange-500 to-amber-400 h-36 animate-pulse" />
        <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
          <div className="h-4 bg-gray-100 rounded-full w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded-full w-full animate-pulse" />
          <div className="h-4 bg-gray-100 rounded-full w-2/3 animate-pulse" />
        </div>
      </main>
    );
  }

  if (!page) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">🧭</p>
        <h1 className="font-display font-bold text-2xl text-anthracite mb-2">Page introuvable</h1>
        <p className="text-gray-500 mb-6">Cette page n&apos;existe pas ou n&apos;est plus disponible.</p>
        <Link href="/" className="inline-block bg-solar text-white font-medium px-6 py-3 rounded-2xl hover:bg-orange-600 transition">
          Retour à l&apos;accueil
        </Link>
      </main>
    );
  }

  return (
    <main>
      <PageHeader title={page.title} crumbs={[{ label: page.title }]} />
      <article className="max-w-3xl mx-auto px-4 py-12">
        <MarkdownLite content={page.content} />
      </article>
    </main>
  );
}
