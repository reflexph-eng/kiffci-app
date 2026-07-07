'use client';
import { useCms } from '@/context/CmsContext';
import { AlertTriangle } from 'lucide-react';

export default function MaintenanceBanner() {
  const { settings } = useCms();
  if (!settings.maintenanceMode) return null;
  return (
    <div className="bg-yellow-500 text-yellow-900 px-4 py-3 flex items-center justify-center gap-3 text-sm font-semibold">
      <AlertTriangle size={18} />
      L'application est en mode maintenance. Certaines fonctionnalités peuvent être indisponibles.
    </div>
  );
}
