'use client';
/**
 * AdSlot — affiche l'encart actif pour un emplacement, ou NE REND RIEN.
 * Exigence produit : un emplacement désactivé ne doit jamais défigurer la mise en page.
 */
import { useEffect, useState } from 'react';
import { getActiveAdForSlot, trackAdView, trackAdClick } from '@/lib/ads-firestore';
import { AdCreative, AdSlotId } from '@/types';

interface Props {
  slotId: AdSlotId;
  /** 'banner' = large horizontal (défaut), 'card' = format carte insérée dans une grille, 'sidebar' = vertical */
  variant?: 'banner' | 'card' | 'sidebar';
}

export default function AdSlot({ slotId, variant = 'banner' }: Props) {
  const [ad, setAd]           = useState<AdCreative | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getActiveAdForSlot(slotId).then(a => {
      if (cancelled) return;
      setAd(a);
      setResolved(true);
      if (a) trackAdView(a.id).catch(() => {});
    }).catch(() => setResolved(true));
    return () => { cancelled = true; };
  }, [slotId]);

  // Rien à afficher (chargement ou pas d'encart actif) : ne rend absolument rien.
  if (!resolved || !ad) return null;

  function handleClick() {
    if (ad) trackAdClick(ad.id).catch(() => {});
  }

  if (variant === 'sidebar') {
    return (
      <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer sponsored" onClick={handleClick}
        className="block rounded-3xl overflow-hidden shadow-card group">
        <div className="relative">
          <img src={ad.imageUrl} alt={ad.title} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" />
          <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full">Publicité</span>
        </div>
        {ad.sponsorName && (
          <p className="text-xs text-gray-400 px-3 py-2">Sponsorisé par <span className="font-medium text-gray-600">{ad.sponsorName}</span></p>
        )}
      </a>
    );
  }

  if (variant === 'card') {
    return (
      <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer sponsored" onClick={handleClick}
        className="group bg-white rounded-4xl overflow-hidden shadow-card hover:shadow-soft hover:-translate-y-1 transition-all duration-200 flex flex-col">
        <div className="relative h-44 bg-gray-100 overflow-hidden">
          <img src={ad.imageUrl} alt={ad.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <span className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">Publicité</span>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-display font-bold text-base leading-snug group-hover:text-solar transition-colors line-clamp-2">{ad.title}</h3>
          {ad.sponsorName && <p className="mt-2 text-xs text-gray-400">Sponsorisé par {ad.sponsorName}</p>}
        </div>
      </a>
    );
  }

  // banner (défaut)
  return (
    <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer sponsored" onClick={handleClick}
      className="relative block rounded-4xl overflow-hidden shadow-card group my-8">
      <img src={ad.imageUrl} alt={ad.title} className="w-full h-32 md:h-44 object-cover group-hover:scale-[1.02] transition-transform duration-500" />
      <span className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">Publicité</span>
      {ad.sponsorName && (
        <span className="absolute bottom-3 right-3 bg-white/95 text-anthracite text-xs font-medium px-3 py-1.5 rounded-full">
          Sponsorisé par {ad.sponsorName}
        </span>
      )}
    </a>
  );
}
