'use client';
/** BetaRibbon — bandeau discret « version bêta », masquable par session. */
import { useEffect, useState } from 'react';
import { useCms } from '@/context/CmsContext';
import { FlaskConical, X } from 'lucide-react';

const DISMISS_KEY = 'kiffci_beta_ribbon_dismissed_v1';

export default function BetaRibbon() {
  const { settings } = useCms();
  const [dismissed, setDismissed] = useState(true); // true par défaut pour éviter un flash au premier rendu serveur

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === '1');
  }, []);

  if (!settings.betaModeEnabled || dismissed) return null;

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  }

  return (
    <div className="bg-anthracite text-white text-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <p className="flex items-center gap-2">
          <FlaskConical size={14} className="text-solar shrink-0" aria-hidden />
          <span>{settings.betaMessage}</span>
        </p>
        <button onClick={dismiss} aria-label="Masquer ce message" className="text-white/60 hover:text-white shrink-0">
          <X size={15} aria-hidden />
        </button>
      </div>
    </div>
  );
}
