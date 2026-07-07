'use client';
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  getPartnerNotifications, getAdminPendingCount, getLastSeenAt, markNotificationsSeen,
} from '@/lib/notifications';
import { ModerationLog } from '@/types';
import Link from 'next/link';

export default function NotificationBell() {
  const { appUser, firebaseUser } = useAuth();
  const [open, setOpen]           = useState(false);
  const [logs, setLogs]           = useState<ModerationLog[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [unseenCount, setUnseenCount]   = useState(0);

  const isAdmin   = appUser?.role === 'admin';
  const isPartner = appUser?.role === 'partner' || isAdmin;

  useEffect(() => {
    if (!firebaseUser || !isPartner) return;
    const lastSeen = getLastSeenAt(firebaseUser.uid);

    if (isAdmin) {
      getAdminPendingCount().then(setPendingCount).catch(() => {});
    }
    getPartnerNotifications(firebaseUser.uid).then(items => {
      setLogs(items);
      setUnseenCount(items.filter(l => l.createdAt > lastSeen).length);
    }).catch(() => {});
  }, [firebaseUser, isPartner, isAdmin]);

  if (!isPartner || !firebaseUser) return null;

  function handleToggle() {
    setOpen(o => !o);
    if (!open) {
      markNotificationsSeen(firebaseUser!.uid);
      setUnseenCount(0);
    }
  }

  const badgeCount = unseenCount + (isAdmin ? pendingCount : 0);

  return (
    <div className="relative">
      <button onClick={handleToggle} aria-label="Notifications" className="relative p-2 text-gray-600 hover:text-solar transition">
        <Bell size={19} aria-hidden />
        {badgeCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-2xl shadow-soft border border-gray-100 z-50 max-h-96 overflow-y-auto">
          {isAdmin && pendingCount > 0 && (
            <Link href="/admin/moderation" onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm bg-solar/5 text-solar font-medium border-b border-gray-100 hover:bg-solar/10 transition">
              {pendingCount} élément{pendingCount > 1 ? 's' : ''} en attente de modération →
            </Link>
          )}
          {logs.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-400 text-center">Aucune notification pour le moment.</p>
          ) : (
            logs.map(l => (
              <div key={l.id} className="px-4 py-3 text-sm border-b border-gray-50 last:border-0">
                <p className={`font-medium ${l.action === 'approved' ? 'text-tropical' : 'text-red-600'}`}>
                  {l.action === 'approved' ? '✅ Approuvé' : '❌ Rejeté'} : {l.targetName}
                </p>
                {l.reason && <p className="text-xs text-gray-500 mt-0.5">{l.reason}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{new Date(l.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
