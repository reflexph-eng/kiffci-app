'use client';
import { useAuth } from '@/context/AuthContext';
import { AlertTriangle } from 'lucide-react';

export default function SuspendedBanner() {
  const { appUser } = useAuth();
  if (!appUser?.isSuspended) return null;
  return (
    <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 rounded-2xl px-5 py-4">
      <AlertTriangle size={18} className="shrink-0 mt-0.5" aria-hidden />
      <div>
        <p className="font-medium text-sm">Votre compte est actuellement suspendu.</p>
        <p className="text-sm text-red-600/80 mt-0.5">
          Vous ne pouvez plus publier de nouveaux établissements ou événements. Contactez-nous pour en savoir plus.
        </p>
      </div>
    </div>
  );
}
