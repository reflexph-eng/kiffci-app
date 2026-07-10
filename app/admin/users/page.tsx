'use client';
import { useEffect, useMemo, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { getAllUsersAdmin, changeUserRole, setUserSuspended, setAdminPermissions, promoteConfiguredOwner } from '@/lib/users-admin';
import { AdminPermission, AppUser, UserRole } from '@/types';
import { ADMIN_PERMISSIONS, ALL_ADMIN_PERMISSIONS } from '@/lib/permissions';
import { Users, Search, Shield, Store, User as UserIcon, Ban, CheckCircle2, ShieldCheck, Crown, KeyRound, X } from 'lucide-react';

const ROLE_LABELS: Record<UserRole, string> = { user:'Utilisateur', partner:'Partenaire', moderator:'Modérateur', admin:'Admin', super_admin:'Super Admin' };
const ROLE_ICONS: Record<UserRole, typeof UserIcon> = { user:UserIcon, partner:Store, moderator:ShieldCheck, admin:Shield, super_admin:Crown };
const ROLE_COLORS: Record<UserRole, string> = { user:'bg-gray-100 text-gray-600', partner:'bg-lagoon/10 text-lagoon', moderator:'bg-violet-50 text-violet-700', admin:'bg-solar/10 text-solar', super_admin:'bg-amber-50 text-amber-700' };

export default function AdminUsersPage() {
  const { appUser, refreshUser } = useAuth();
  const [users,setUsers]=useState<AppUser[]>([]); const [loading,setLoading]=useState(true); const [q,setQ]=useState('');
  const [roleFilter,setRoleFilter]=useState<UserRole|'all'>('all'); const [busy,setBusy]=useState<string|null>(null);
  const [suspendTarget,setSuspendTarget]=useState<AppUser|null>(null); const [suspendReason,setSuspendReason]=useState('');
  const [permissionTarget,setPermissionTarget]=useState<AppUser|null>(null); const [draftPermissions,setDraftPermissions]=useState<AdminPermission[]>([]);
  const isSuper=appUser?.role==='super_admin';
  async function refresh(){ setUsers(await getAllUsersAdmin()); setLoading(false); }
  useEffect(()=>{ refresh(); },[]);
  const filtered=useMemo(()=>users.filter(u=>(roleFilter==='all'||u.role===roleFilter)&&`${u.displayName} ${u.email}`.toLowerCase().includes(q.toLowerCase())),[users,q,roleFilter]);

  async function handleRoleChange(u:AppUser,newRole:UserRole){
    if(!appUser||!isSuper) return;
    if(u.role==='super_admin'&&u.uid!==appUser.uid){ alert('Un Super Admin ne peut être modifié que par le propriétaire concerné.'); return; }
    if(u.uid===appUser.uid&&newRole!=='super_admin'){ alert('Le compte propriétaire ne peut pas se rétrograder lui-même.'); return; }
    setBusy(u.uid); try { await changeUserRole(u.uid,newRole,appUser.uid,appUser.displayName||appUser.email); await refresh(); } finally { setBusy(null); }
  }
  function openPermissions(u:AppUser){ setPermissionTarget(u); setDraftPermissions(Array.isArray(u.permissions)?u.permissions:ALL_ADMIN_PERMISSIONS); }
  function togglePermission(p:AdminPermission){ setDraftPermissions(v=>v.includes(p)?v.filter(x=>x!==p):[...v,p]); }
  async function savePermissions(){ if(!permissionTarget||!appUser||!isSuper)return; setBusy(permissionTarget.uid); try{ await setAdminPermissions(permissionTarget.uid,draftPermissions,appUser.uid,appUser.displayName||appUser.email); setPermissionTarget(null); await refresh(); } finally{setBusy(null);} }
  async function confirmSuspend(){ if(!suspendTarget||!appUser)return; if(suspendTarget.role==='super_admin'){alert('Le Super Admin ne peut pas être suspendu.');return;} setBusy(suspendTarget.uid); try{await setUserSuspended(suspendTarget.uid,true,suspendReason,appUser.uid,appUser.displayName||appUser.email);setSuspendTarget(null);setSuspendReason('');await refresh();}finally{setBusy(null);} }
  async function handleUnsuspend(u:AppUser){ if(!appUser)return; setBusy(u.uid); try{await setUserSuspended(u.uid,false,'',appUser.uid,appUser.displayName||appUser.email);await refresh();}finally{setBusy(null);} }
  async function activateOwner(){ if(!appUser)return; setBusy(appUser.uid); try{await promoteConfiguredOwner(appUser.uid,appUser.email,appUser.displayName||appUser.email); await refreshUser(); await refresh();}catch(e){alert(e instanceof Error?e.message:'Activation impossible');}finally{setBusy(null);} }

  return <AuthGuard adminOnly requiredPermission="users.manage"><main className="max-w-6xl mx-auto px-4 py-10">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8"><div><h1 className="font-display font-bold text-3xl text-anthracite flex items-center gap-2"><Users className="text-solar"/> Utilisateurs, rôles & accès</h1><p className="text-gray-500 text-sm mt-2">{users.length} compte(s) · les permissions détaillées sont réservées au Super Admin.</p></div>
    {appUser?.role==='admin'&&process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL?.toLowerCase()===appUser.email.toLowerCase()&&<button onClick={activateOwner} disabled={busy===appUser.uid} className="inline-flex items-center justify-center gap-2 rounded-xl bg-anthracite px-4 py-3 text-sm font-bold text-white"><Crown size={17}/> Activer mon compte propriétaire</button>}</div>

    <div className="flex flex-col md:flex-row gap-3 mb-6"><div className="relative flex-1"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher par nom ou e-mail…" className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm"/></div><div className="flex gap-2 overflow-x-auto">{(['all','user','partner','moderator','admin','super_admin'] as const).map(r=><button key={r} onClick={()=>setRoleFilter(r)} className={`whitespace-nowrap px-3 py-2.5 rounded-xl text-sm font-medium ${roleFilter===r?'bg-solar text-white':'bg-gray-100 text-gray-600'}`}>{r==='all'?'Tous':ROLE_LABELS[r]}</button>)}</div></div>

    {loading?<p className="text-gray-400 text-sm">Chargement…</p>:<div className="border border-gray-100 rounded-2xl divide-y divide-gray-100 bg-white overflow-hidden">{filtered.map(u=>{const Icon=ROLE_ICONS[u.role];return <div key={u.uid} className={`px-5 py-4 flex flex-col lg:flex-row lg:items-center gap-4 ${u.isSuspended?'opacity-60':''}`}><div className="flex items-center gap-3 min-w-0 flex-1"><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ROLE_COLORS[u.role]}`}><Icon size={17}/></div><div className="min-w-0"><p className="font-bold text-anthracite truncate">{u.displayName||'(sans nom)'} {u.uid===appUser?.uid&&<span className="text-xs text-solar">(vous)</span>}</p><p className="text-xs text-gray-400 truncate">{u.email}</p></div></div><div className="flex flex-wrap items-center gap-2">
      <select value={u.role} disabled={!isSuper||busy===u.uid||u.role==='super_admin'} onChange={e=>handleRoleChange(u,e.target.value as UserRole)} className="text-sm px-3 py-2 rounded-xl border border-gray-200 bg-white disabled:opacity-50"><option value="user">Utilisateur</option><option value="partner">Partenaire</option><option value="moderator">Modérateur</option><option value="admin">Admin</option><option value="super_admin">Super Admin</option></select>
      {u.role==='admin'&&isSuper&&<button onClick={()=>openPermissions(u)} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:border-solar"><KeyRound size={15}/> Permissions</button>}
      {u.role!=='super_admin'&&(u.isSuspended?<button onClick={()=>handleUnsuspend(u)} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-emerald-50 text-emerald-700"><CheckCircle2 size={15}/> Réactiver</button>:<button onClick={()=>setSuspendTarget(u)} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-red-50 text-red-600"><Ban size={15}/> Suspendre</button>)}
    </div></div>})}</div>}

    {permissionTarget&&<div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"><div className="w-full max-w-2xl rounded-2xl bg-white p-6 max-h-[90vh] overflow-y-auto"><div className="flex items-start justify-between gap-4"><div><h2 className="font-display text-2xl font-bold">Permissions de {permissionTarget.displayName||permissionTarget.email}</h2><p className="text-sm text-gray-500 mt-1">Active uniquement les actions nécessaires à cet administrateur.</p></div><button onClick={()=>setPermissionTarget(null)}><X/></button></div><div className="mt-6 divide-y divide-gray-100 border-y border-gray-100">{ADMIN_PERMISSIONS.map(item=><label key={item.key} className="flex gap-4 py-4 cursor-pointer"><input type="checkbox" checked={draftPermissions.includes(item.key)} onChange={()=>togglePermission(item.key)} className="mt-1 accent-orange-500"/><span><span className="block font-semibold text-anthracite">{item.label}</span><span className="block text-sm text-gray-500 mt-1">{item.description}</span></span></label>)}</div><div className="mt-6 flex justify-end gap-3"><button onClick={()=>setPermissionTarget(null)} className="px-4 py-2.5 rounded-xl border">Annuler</button><button onClick={savePermissions} className="px-4 py-2.5 rounded-xl bg-solar text-white font-bold">Enregistrer</button></div></div></div>}
    {suspendTarget&&<div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6"><h2 className="font-display text-xl font-bold">Suspendre {suspendTarget.displayName||suspendTarget.email}</h2><textarea value={suspendReason} onChange={e=>setSuspendReason(e.target.value)} placeholder="Motif de la suspension" className="mt-4 w-full min-h-28 rounded-xl border p-3"/><div className="mt-4 flex justify-end gap-3"><button onClick={()=>setSuspendTarget(null)} className="px-4 py-2 rounded-xl border">Annuler</button><button onClick={confirmSuspend} className="px-4 py-2 rounded-xl bg-red-600 text-white">Confirmer</button></div></div></div>}
  </main></AuthGuard>;
}
