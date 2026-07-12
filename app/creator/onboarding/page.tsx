'use client';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { activateCreatorAccount } from '@/lib/firestore';
import { Rocket, ShieldCheck } from 'lucide-react';

export default function CreatorOnboardingPage(){return <AuthGuard><CreatorOnboarding/></AuthGuard>}
function CreatorOnboarding(){
 const {appUser,firebaseUser,refreshUser}=useAuth(); const router=useRouter();
 const [form,setForm]=useState({name:'',description:'',phone:'',whatsapp:'',website:'',city:'Abidjan',district:'',address:'',instagram:'',facebook:''});
 const [busy,setBusy]=useState(false); const [error,setError]=useState('');
 useEffect(()=>{if(appUser)setForm(f=>({...f,name:appUser.displayName||appUser.username||appUser.firstName||''}))},[appUser]);
 async function submit(e:FormEvent){e.preventDefault();if(!firebaseUser||!appUser)return; if(form.name.trim().length<2||form.description.trim().length<20){setError('Renseigne un nom et une description d’au moins 20 caractères.');return} setBusy(true);setError('');
  try{await activateCreatorAccount(firebaseUser.uid,{creatorName:form.name.trim(),creatorDescription:form.description.trim(),creatorPhone:form.phone.trim(),creatorWhatsapp:form.whatsapp.trim(),creatorWebsite:form.website.trim(),creatorInstagram:form.instagram.trim(),creatorFacebook:form.facebook.trim(),creatorCity:form.city.trim(),creatorDistrict:form.district.trim(),creatorAddress:form.address.trim(),photoURL:appUser.photoURL});
   await refreshUser();router.replace('/partner/dashboard');
  }catch(err){console.error(err);setError('Activation impossible. Vérifie ta connexion puis réessaie.')}finally{setBusy(false)} }
 const field='w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-solar';
 return <main className="site-container py-10 md:py-16"><div className="mx-auto max-w-3xl"><div className="rounded-[2rem] bg-anthracite p-7 text-white md:p-10"><Rocket className="text-solar"/><p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-solar">Écosystème créateur</p><h1 className="mt-2 font-display text-4xl font-bold">Devenir créateur d’expériences</h1><p className="mt-4 max-w-2xl text-white/70">Crée ta vitrine KIFFCI et commence immédiatement à préparer les expériences que tu souhaites faire vivre.</p></div>
 <form onSubmit={submit} className="mt-8 space-y-6 rounded-[2rem] border bg-white p-6 md:p-8"><div className="grid gap-5 md:grid-cols-2"><label className="md:col-span-2 text-sm font-bold">Nom public du créateur<input className={`${field} mt-2`} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></label><label className="md:col-span-2 text-sm font-bold">Description<textarea rows={5} className={`${field} mt-2`} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required/></label>{[['phone','Téléphone'],['whatsapp','WhatsApp'],['website','Site web'],['instagram','Instagram'],['facebook','Facebook'],['city','Ville'],['district','Commune / quartier'],['address','Adresse']].map(([k,l])=><label key={k} className="text-sm font-bold">{l}<input className={`${field} mt-2`} value={form[k as keyof typeof form]} onChange={e=>setForm({...form,[k]:e.target.value})}/></label>)}</div>
 <div className="flex items-start gap-3 rounded-2xl bg-tropical/10 p-4 text-sm text-gray-700"><ShieldCheck className="shrink-0 text-tropical" size={20}/><p>Ton profil Créateur est activé immédiatement. La vérification officielle et le statut Partenaire KIFFCI feront l’objet d’un parcours séparé.</p></div>{error&&<p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}<button disabled={busy} className="w-full rounded-2xl bg-solar py-4 font-bold text-white disabled:opacity-60">{busy?'Activation…':'Activer mon Espace Créateur'}</button></form></div></main>
}
