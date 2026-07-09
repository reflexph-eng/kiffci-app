'use client';
/** /admin/users — gestion des utilisateurs et des rôles (Sprint 3). */
import { useEffect, useMemo, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { getAllUsersAdmin, changeUserRole, setUserSuspended } from '@/lib/users-admin';
import { AppUser, UserRole } from '@/types';
import { Users, Search, Shield, Store, User as UserIcon, Ban, CheckCircle2, ShieldCheck } from 'lucide-react';

const ROLE_LABELS: Record<UserRole, string> = { user: 'Utilisateur', partner: 'Partenaire', moderator: 'Modérateur', admin: 'Admin' };
const ROLE_ICONS: Record<UserRole, typeof UserIcon> = { user: UserIcon, partner: Store, moderator: ShieldCheck, admin: Shield };
const ROLE_COLORS: Record<UserRole, string> = {
  user: 'bg-gray-100 text-gray-600', partner: 'bg-lagoon/10 text-lagoon', moderator: 'bg-violet-50 text-violet-700', admin: 'bg-solar/10 text-solar',
};

export default function AdminUsersPage() {
  const { appUser } = useAuth();
  const [users, setUsers]     = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ]             = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [suspendTarget, setSuspendTarget] = useState<AppUser | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [busy, setBusy]       = useState<string | null>(null);

  async function refresh() {
    setUsers(await getAllUsersAdmin());
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => users.filter(u => {
    const okRole = roleFilter === 'all' || u.role === roleFilter;
    const text = `${u.displayName} ${u.email}`.toLowerCase();
    return okRole && text.includes(q.toLowerCase());
  }), [users, q, roleFilter]);

  async function handleRoleChange(u: AppUser, newRole: UserRole) {
    if (!appUser) return;
    if (u.uid === appUser.uid && newRole !== 'admin') {
      if (!confirm('Vous allez retirer vos propres droits admin. Continuer ?')) return;
    }
    setBusy(u.uid);
    await changeUserRole(u.uid, newRole, appUser.uid, appUser.displayName || appUser.email);
    await refresh();
    setBusy(null);
  }

  async function confirmSuspend() {
    if (!suspendTarget || !appUser) return;
    setBusy(suspendTarget.uid);
    await setUserSuspended(suspendTarget.uid, true, suspendReason, appUser.uid, appUser.displayName || appUser.email);
    setSuspendTarget(null); setSuspendReason('');
    await refresh();
    setBusy(null);
  }

  async function handleUnsuspend(u: AppUser) {
    if (!appUser) return;
    setBusy(u.uid);
    await setUserSuspended(u.uid, false, '', appUser.uid, appUser.displayName || appUser.email);
    await refresh();
    setBusy(null);
  }

  return (
    <AuthGuard adminOnly>
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="font-display font-bold text-3xl text-anthracite flex items-center gap-2 mb-2">
          <Users className="text-solar" aria-hidden /> Utilisateurs & rôles
        </h1>
        <p className="text-gray-500 text-sm mb-8">{users.length} utilisateur(s) inscrit(s)</p>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher par nom ou e-mail…"
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-gray-200 focus:border-solar outline-none text-sm" />
          </div>
          <div className="flex gap-2">
            {(['all', 'user', 'partner', 'moderator', 'admin'] as const).map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-4 py-2.5 rounded-2xl text-sm font-medium transition ${
                  roleFilter === r ? 'bg-solar text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {r === 'all' ? 'Tous' : ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Chargement…</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun utilisateur trouvé.</p>
        ) : (
          <div className="border border-gray-100 rounded-2xl divide-y divide-gray-100 bg-white overflow-hidden">
            {filtered.map(u => {
              const RoleIcon = ROLE_ICONS[u.role];
              return (
                <div key={u.uid} className={`px-6 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 hover:bg-gray-50/60 transition ${u.isSuspended ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${ROLE_COLORS[u.role]}`}>
                      <RoleIcon size={16} aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display font-bold text-anthracite truncate flex items-center gap-2">
                        {u.displayName || '(sans nom)'}
                        {u.isSuspended && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Suspendu</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select value={u.role} disabled={busy === u.uid}
                      onChange={e => handleRoleChange(u, e.target.value as UserRole)}
                      className="text-sm px-3 py-2 rounded-xl border border-gray-200 focus:border-solar outline-none bg-white disabled:opacity-50">
                      <option value="user">Utilisateur</option>
                      <option value="partner">Partenaire</option>
                      <option value="moderator">Modérateur</option>
                      <option value="admin">Admin</option>
                    </select>

                    {u.isSuspended ? (
                      <button onClick={() => handleUnsuspend(u)} disabled={busy === u.uid}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-tropical/10 text-tropical hover:bg-tropical/20 transition disabled:opacity-50">
                        <CheckCircle2 size={13} aria-hidden /> Réactiver
                      </button>
                    ) : (
                      <button onClick={() => { setSuspendTarget(u); setSuspendReason(''); }} disabled={busy === u.uid}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50">
                        <Ban size={13} aria-hidden /> Suspendre
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modale suspension */}
        {suspendTarget && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full">
              <h2 className="font-display font-bold text-lg mb-1">Suspendre {suspendTarget.displayName || suspendTarget.email}</h2>
              <p className="text-sm text-gray-500 mb-4">Le motif reste interne, il n'est pas envoyé automatiquement à l'utilisateur.</p>
              <textarea value={suspendReason} onChange={e => setSuspendReason(e.target.value)} rows={3}
                placeholder="Motif de la suspension…"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm mb-4" />
              <div className="flex gap-3">
                <button onClick={confirmSuspend}
                  className="bg-red-600 text-white font-medium px-5 py-2.5 rounded-2xl hover:bg-red-700 transition text-sm">
                  Confirmer la suspension
                </button>
                <button onClick={() => setSuspendTarget(null)}
                  className="bg-gray-100 text-gray-600 font-medium px-5 py-2.5 rounded-2xl hover:bg-gray-200 transition text-sm">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
