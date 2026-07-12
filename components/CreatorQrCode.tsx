'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, QrCode, Share2, MessageCircle } from 'lucide-react';

type CreatorQrCodeProps = {
  creatorId: string;
  creatorName: string;
};

const QR_SERVICE_URL = 'https://api.qrserver.com/v1/create-qr-code/';

export default function CreatorQrCode({ creatorId, creatorName }: CreatorQrCodeProps) {
  const [creatorUrl, setCreatorUrl] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setCreatorUrl(`${window.location.origin}/establishments/${creatorId}`);
  }, [creatorId]);

  const qrImageUrl = useMemo(() => {
    if (!creatorUrl) return '';
    const params = new URLSearchParams({
      size: '640x640',
      margin: '16',
      format: 'png',
      data: creatorUrl,
    });
    return `${QR_SERVICE_URL}?${params.toString()}`;
  }, [creatorUrl]);

  const shareText = useMemo(
    () => `Découvre toutes les expériences proposées par ${creatorName} sur KIFFCI.`,
    [creatorName],
  );

  const handleDownload = async () => {
    if (!qrImageUrl) return;
    const safeName = creatorName.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');

    try {
      const response = await fetch(qrImageUrl);
      if (!response.ok) throw new Error('QR download failed');
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `qrcode-kiffci-${safeName || creatorId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('QR Code download error:', error);
      window.open(qrImageUrl, '_blank', 'noopener,noreferrer');
      setMessage('Le QR Code a été ouvert dans un nouvel onglet. Enregistre l’image depuis cet écran.');
    }
  };

  const handleShare = async () => {
    if (!creatorUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${creatorName} sur KIFFCI`,
          text: shareText,
          url: creatorUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(creatorUrl);
      setMessage('Lien copié.');
    } catch (error) {
      if ((error as DOMException)?.name !== 'AbortError') {
        setMessage('Le partage n’a pas pu être lancé.');
      }
    }
  };

  const whatsappUrl = creatorUrl
    ? `https://wa.me/?text=${encodeURIComponent(`${shareText} ${creatorUrl}`)}`
    : '#';

  return (
    <section className="mt-10 rounded-3xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-solar/10 p-3 text-solar">
          <QrCode size={22} aria-hidden />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-solar">QR Code permanent</p>
          <h2 className="mt-1 font-display text-xl font-bold text-anthracite">Partager toutes les expériences de {creatorName}</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Ce QR Code reste le même lorsque de nouvelles expériences sont ajoutées. Il peut être utilisé sur les affiches, flyers, réseaux sociaux et supports de communication.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-[180px_1fr] sm:items-center">
        <div className="mx-auto w-full max-w-[180px] rounded-2xl border border-gray-200 bg-white p-3">
          {qrImageUrl ? (
            <img src={qrImageUrl} alt={`QR Code du créateur ${creatorName}`} className="h-auto w-full" />
          ) : (
            <div className="aspect-square animate-pulse rounded-xl bg-gray-100" />
          )}
        </div>

        <div>
          <p className="break-all rounded-2xl bg-gray-50 px-4 py-3 text-xs text-gray-600">{creatorUrl || 'Génération du lien…'}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!qrImageUrl}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-anthracite px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={16} aria-hidden /> Télécharger
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={!creatorUrl}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-solar px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Share2 size={16} aria-hidden /> Partager
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!creatorUrl}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-tropical px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <MessageCircle size={16} aria-hidden /> WhatsApp
            </a>
          </div>
          {message && <p className="mt-3 text-sm font-medium text-lagoon" role="status">{message}</p>}
        </div>
      </div>
    </section>
  );
}
