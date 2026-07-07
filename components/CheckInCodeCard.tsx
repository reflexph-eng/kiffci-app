'use client';
import { useState } from 'react';
import { regenerateCheckInCode } from '@/lib/partner-firestore';
import { KeyRound, RefreshCw, Copy, Check } from 'lucide-react';

export default function CheckInCodeCard({ establishmentId, code, onRegenerated }: {
  establishmentId: string; code: string; onRegenerated: (newCode: string) => void;
}) {
  const [busy, setBusy]     = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleRegenerate() {
    if (!confirm("Régénérer le code invalidera l'ancien immédiatement. Continuer ?")) return;
    setBusy(true);
    const newCode = await regenerateCheckInCode(establishmentId);
    onRegenerated(newCode);
    setBusy(false);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-3 bg-lagoon/5 border border-lagoon/20 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <KeyRound size={15} className="text-lagoon shrink-0" aria-hidden />
        <div>
          <p className="text-xs text-gray-500">Code de passage — à afficher sur place pour certifier les visites</p>
          <p className="font-mono font-bold text-lg text-lagoon tracking-widest">{code || '——————'}</p>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <button onClick={handleCopy} aria-label="Copier le code"
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition">
          {copied ? <Check size={13} aria-hidden /> : <Copy size={13} aria-hidden />} {copied ? 'Copié' : 'Copier'}
        </button>
        <button onClick={handleRegenerate} disabled={busy}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50">
          <RefreshCw size={13} aria-hidden /> {busy ? '…' : 'Régénérer'}
        </button>
      </div>
    </div>
  );
}
