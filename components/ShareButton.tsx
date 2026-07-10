'use client';
import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export default function ShareButton({ title, text, url }: { title: string; text?: string; url?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
      } catch {
        // L'utilisateur a annulé le partage — rien à faire.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Copie indisponible — silencieux.
    }
  }

  return (
    <button onClick={handleShare} aria-label="Partager"
      className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-2xl hover:bg-gray-200 transition">
      {copied ? <><Check size={17} aria-hidden /> Lien copié !</> : <><Share2 size={17} aria-hidden /> Partager</>}
    </button>
  );
}
