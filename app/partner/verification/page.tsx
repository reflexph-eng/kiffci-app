'use client';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BadgeCheck, CheckCircle2, FileCheck2, ShieldCheck } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { CreatorVerificationRequest } from '@/types';
import { getMyVerificationRequest, saveVerificationDraft, submitVerificationRequest } from '@/lib/trust-safety-firestore';

type VerificationForm = Omit<CreatorVerificationRequest, 'id'|'creatorId'|'status'|'createdAt'|'updatedAt'|'submittedAt'|'reviewedAt'|'reviewedBy'|'adminNote'|'creatorDisplayName'|'creatorEmail'>;
const empty: VerificationForm = {
  legalName:'', commercialName:'', entityType:'individual' as const, rccm:'', taxpayerNumber:'',
  professionalPhone:'', professionalEmail:'', professionalAddress:'',
  identityFront:{label:'Pièce d’identité recto',url:''}, identityBack:{label:'Pièce d’identité verso',url:''},
  rccmDocument:{label:'RCCM ou équivalent',url:''}, taxpayerDocument:{label:'Compte contribuable',url:''},
  swornDeclarationAccepted:false, termsAccepted:false,
};

function VerificationContent(){
 const {appUser}=useAuth(); const [form,setForm]=useState(empty); const [request,setRequest]=useState<CreatorVerificationRequest|null>(null); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('');
 useEffect(()=>{if(!appUser)return; getMyVerificationRequest(appUser.uid).then(r=>{setRequest(r); if(r)setForm({...empty,...r});});},[appUser]);
 const locked=request && ['pending','approved','partner'].includes(request.status);
 const complete=useMemo(()=>Boolean(form.legalName&&form.professionalPhone&&form.professionalEmail&&form.professionalAddress&&form.identityFront.url&&form.identityBack.url&&form.swornDeclarationAccepted&&form.termsAccepted),[form]);
 const set=(k:string,v:any)=>setForm(p=>({...p,[k]:v}));
 async function save(e?:FormEvent){e?.preventDefault(); if(!appUser)return; setBusy(true); setMessage(''); try{await saveVerificationDraft(appUser.uid,{...form,creatorDisplayName:appUser.displayName,creatorEmail:appUser.email}); setMessage('Brouillon enregistré.'); setRequest(await getMyVerificationRequest(appUser.uid));}catch{setMessage('Impossible d’enregistrer le dossier.');}finally{setBusy(false)}}
 async function submit(){if(!appUser||!complete)return; await save(); setBusy(true); try{await submitVerificationRequest(appUser.uid); setRequest(await getMyVerificationRequest(appUser.uid)); setMessage('Dossier transmis à l’équipe KIFFCI.');}finally{setBusy(false)}}
 const statusLabel=request?.status==='pending'?'En cours d’examen':request?.status==='needs_information'?'Complément demandé':request?.status==='approved'?'Créateur vérifié':request?.status==='partner'?'Partenaire KIFFCI':request?.status==='rejected'?'Demande refusée':'Brouillon';
 return <div className="mx-auto max-w-5xl"><Link href="/partner/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-solar"><ArrowLeft size={16}/> Retour</Link>
 <header className="mt-7 rounded-[2rem] bg-anthracite px-6 py-8 text-white md:px-10"><div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-white/55">Trust & Safety</p><h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">Vérification Créateur</h1><p className="mt-3 max-w-2xl text-white/70">Renforce la confiance autour de ton profil et de tes expériences.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold"><ShieldCheck size={17}/>{statusLabel}</span></div></header>
 {request?.adminNote&&<div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5"><strong>Message de l’administration</strong><p className="mt-2 text-sm text-gray-700">{request.adminNote}</p></div>}
 <form onSubmit={save} className="mt-8 space-y-8">
 <section className="rounded-2xl border border-gray-200 bg-white p-6"><h2 className="flex items-center gap-2 font-display text-2xl font-bold"><BadgeCheck className="text-solar"/> Identité professionnelle</h2><div className="mt-6 grid gap-5 md:grid-cols-2">
 <Field label="Nom légal *" value={form.legalName} onChange={v=>set('legalName',v)} disabled={!!locked}/><Field label="Nom commercial" value={form.commercialName} onChange={v=>set('commercialName',v)} disabled={!!locked}/>
 <label className="text-sm font-semibold">Type d’activité<select disabled={!!locked} value={form.entityType} onChange={e=>set('entityType',e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3"><option value="individual">Personne physique</option><option value="company">Entreprise</option><option value="association">Association</option><option value="other">Autre</option></select></label>
 <Field label="RCCM ou équivalent" value={form.rccm} onChange={v=>set('rccm',v)} disabled={!!locked}/><Field label="Compte contribuable" value={form.taxpayerNumber} onChange={v=>set('taxpayerNumber',v)} disabled={!!locked}/><Field label="Téléphone professionnel *" value={form.professionalPhone} onChange={v=>set('professionalPhone',v)} disabled={!!locked}/><Field label="Email professionnel *" value={form.professionalEmail} onChange={v=>set('professionalEmail',v)} disabled={!!locked}/><Field label="Adresse professionnelle *" value={form.professionalAddress} onChange={v=>set('professionalAddress',v)} disabled={!!locked}/></div></section>
 <section className="rounded-2xl border border-gray-200 bg-white p-6"><h2 className="flex items-center gap-2 font-display text-2xl font-bold"><FileCheck2 className="text-solar"/> Pièces justificatives</h2><p className="mt-2 text-sm text-gray-500">Ajoute des liens sécurisés vers tes documents. KIFFCI ne stocke pas les fichiers dans Firebase Storage.</p><div className="mt-6 grid gap-5 md:grid-cols-2"><DocField label="Pièce d’identité recto *" value={form.identityFront.url} onChange={v=>set('identityFront',{...form.identityFront,url:v})} disabled={!!locked}/><DocField label="Pièce d’identité verso *" value={form.identityBack.url} onChange={v=>set('identityBack',{...form.identityBack,url:v})} disabled={!!locked}/><DocField label="Document RCCM" value={form.rccmDocument?.url||''} onChange={v=>set('rccmDocument',{label:'RCCM ou équivalent',...(form.rccmDocument||{}),url:v})} disabled={!!locked}/><DocField label="Document compte contribuable" value={form.taxpayerDocument?.url||''} onChange={v=>set('taxpayerDocument',{label:'Compte contribuable',...(form.taxpayerDocument||{}),url:v})} disabled={!!locked}/></div></section>
 <section className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4"><Check label="Je certifie sur l’honneur l’exactitude des informations fournies." checked={form.swornDeclarationAccepted} onChange={v=>set('swornDeclarationAccepted',v)} disabled={!!locked}/><Check label="J’accepte les CGU et la politique de vérification KIFFCI." checked={form.termsAccepted} onChange={v=>set('termsAccepted',v)} disabled={!!locked}/></section>
 {message&&<p className="rounded-xl bg-gray-50 p-4 text-sm">{message}</p>}
 {!locked&&<div className="flex flex-col gap-3 sm:flex-row"><button disabled={busy} className="rounded-xl border border-gray-300 px-5 py-3 font-bold">Enregistrer le brouillon</button><button type="button" onClick={submit} disabled={busy||!complete} className="rounded-xl bg-solar px-5 py-3 font-bold text-white disabled:opacity-40">Transmettre ma demande</button></div>}
 </form></div>
}
function Field({label,value,onChange,disabled}:{label:string;value?:string;onChange:(v:string)=>void;disabled:boolean}){return <label className="text-sm font-semibold">{label}<input disabled={disabled} value={value||''} onChange={e=>onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 disabled:bg-gray-50"/></label>}
function DocField(p:{label:string;value?:string;onChange:(v:string)=>void;disabled:boolean}){return <label className="text-sm font-semibold">{p.label}<input type="url" placeholder="https://..." disabled={p.disabled} value={p.value||''} onChange={e=>p.onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 disabled:bg-gray-50"/></label>}
function Check({label,checked,onChange,disabled}:{label:string;checked:boolean;onChange:(v:boolean)=>void;disabled:boolean}){return <label className="flex items-start gap-3 text-sm"><input type="checkbox" disabled={disabled} checked={checked} onChange={e=>onChange(e.target.checked)} className="mt-1"/><span>{label}</span></label>}
export default function Page(){return <main className="site-container py-10"><AuthGuard partnerOnly><VerificationContent/></AuthGuard></main>}
