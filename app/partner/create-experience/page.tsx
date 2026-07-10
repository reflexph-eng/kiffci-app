'use client';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import ImageUploader from '@/components/ImageUploader';
import { useAuth } from '@/context/AuthContext';
import { getVisibleCategories, proposeCategory } from '@/lib/cms-firestore';
import { createPartnerExperience, getMyEstablishments } from '@/lib/partner-firestore';
import { Category, Establishment, ProfileType } from '@/types';

const MOMENTS = ['Matin', 'Après-midi', 'Soir', 'Week-end'];
const PUBLICS: { value: ProfileType; label: string }[] = [
  { value: 'solo', label: 'Solo' }, { value: 'couple', label: 'Couple' },
  { value: 'famille', label: 'Famille' }, { value: 'amis', label: 'Entre amis' },
];

function Content() {
  const { appUser } = useAuth(); const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]); const [ests, setEsts] = useState<Establishment[]>([]);
  const [images, setImages] = useState<string[]>([]); const [saving, setSaving] = useState(false); const [message, setMessage] = useState('');
  const [form, setForm] = useState({ title:'', description:'', category:'', proposedCategory:'', city:'Abidjan', district:'', duration:'', priceMin:'0', priceMax:'0', priceText:'', openingHours:'', contactPhone:'', whatsapp:'', bookingLink:'', establishmentId:'', tags:'', suitableFor:[] as ProfileType[], bestMoment:[] as string[] });
  useEffect(() => { getVisibleCategories().then(setCategories); if (appUser) getMyEstablishments(appUser.uid).then(setEsts); }, [appUser]);
  const set = (k: keyof typeof form, v: typeof form[keyof typeof form]) => setForm(p => ({...p,[k]:v}));
  const toggle = <T,>(arr:T[], value:T) => arr.includes(value) ? arr.filter(x=>x!==value) : [...arr,value];
  async function submit(e:FormEvent){ e.preventDefault(); if(!appUser || !form.title.trim() || !form.description.trim() || !form.category){setMessage('Complète les champs obligatoires.');return;} if(form.category==='Autre' && !form.proposedCategory.trim()){setMessage('Indique la catégorie que tu proposes.');return;} setSaving(true);
    try { if(form.category==='Autre') await proposeCategory(form.proposedCategory, appUser.uid, appUser.displayName);
      await createPartnerExperience({ title:form.title.trim(), description:form.description.trim(), category: form.category==='Autre' ? `Autre — ${form.proposedCategory.trim()}` : form.category, mood:[], city:form.city, district:form.district, latitude:0, longitude:0, duration:form.duration, priceMin:Number(form.priceMin)||0, priceMax:Number(form.priceMax)||0, priceText:form.priceText, openingHours:form.openingHours, contactPhone:form.contactPhone, whatsapp:form.whatsapp, images, tags:form.tags.split(',').map(x=>x.trim()).filter(Boolean), suitableFor:form.suitableFor, bestMoment:form.bestMoment, isFree:Number(form.priceMax)===0, isPremium:false, isSponsored:false, isPublished:false, bookingLink:form.bookingLink||undefined, linkedEstablishmentId:form.establishmentId||undefined, ownerId:appUser.uid, ownerName:appUser.displayName, status:'pending' });
      setMessage('Expérience soumise à validation.'); setTimeout(()=>router.push('/partner/experiences'),900);
    } catch(err){ console.error(err); setMessage("Impossible d'enregistrer l'expérience."); } finally { setSaving(false); }
  }
  const field='w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-solar focus:ring-2 focus:ring-solar/20';
  return <div className="max-w-3xl"><Link href="/partner/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-solar"><ArrowLeft size={16}/>Retour au dashboard</Link>
    <p className="text-xs font-bold uppercase tracking-[.2em] text-solar">Experience First</p><h1 className="mt-2 flex items-center gap-3 font-display text-4xl font-bold"><Sparkles className="text-solar"/>Publier une expérience</h1><p className="mt-2 text-gray-500">Décris ce que le visiteur va réellement vivre. L’établissement reste le support de l’expérience.</p>
    {message&&<div className="mt-5 rounded-2xl bg-anthracite px-4 py-3 text-sm font-semibold text-white">{message}</div>}
    <form onSubmit={submit} className="mt-8 space-y-6 rounded-[2rem] bg-white p-6 shadow-card md:p-8">
      <div><label className="mb-1 block text-xs font-bold text-gray-500">Titre de l’expérience *</label><input className={field} value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Ex. Coucher de soleil en pirogue sur la lagune"/></div>
      <div><label className="mb-1 block text-xs font-bold text-gray-500">Ce que le visiteur va vivre *</label><textarea className={field} rows={5} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Raconte le déroulé, les émotions, ce qui est inclus et ce qui rend cette expérience unique."/></div>
      <div className="grid gap-4 md:grid-cols-2"><div><label className="mb-1 block text-xs font-bold text-gray-500">Catégorie *</label><select className={field} value={form.category} onChange={e=>set('category',e.target.value)}><option value="">Choisir</option>{categories.map(c=><option key={c.id}>{c.name}</option>)}</select></div><div><label className="mb-1 block text-xs font-bold text-gray-500">Établissement support</label><select className={field} value={form.establishmentId} onChange={e=>set('establishmentId',e.target.value)}><option value="">Activité indépendante</option>{ests.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></div></div>
      {form.category==='Autre'&&<div className="rounded-2xl border border-orange-200 bg-orange-50 p-4"><label className="mb-1 block text-xs font-bold text-orange-800">Nouvelle catégorie proposée *</label><input className={field} value={form.proposedCategory} onChange={e=>set('proposedCategory',e.target.value)} placeholder="Ex. Observation astronomique"/><p className="mt-2 text-xs text-orange-700">Elle sera examinée par l’administration avant d’être proposée à tous.</p></div>}
      <div className="grid gap-4 md:grid-cols-2"><div><label className="mb-1 block text-xs font-bold text-gray-500">Ville</label><input className={field} value={form.city} onChange={e=>set('city',e.target.value)}/></div><div><label className="mb-1 block text-xs font-bold text-gray-500">Quartier / zone</label><input className={field} value={form.district} onChange={e=>set('district',e.target.value)}/></div><div><label className="mb-1 block text-xs font-bold text-gray-500">Durée</label><input className={field} value={form.duration} onChange={e=>set('duration',e.target.value)} placeholder="Ex. 2 heures"/></div><div><label className="mb-1 block text-xs font-bold text-gray-500">Horaires</label><input className={field} value={form.openingHours} onChange={e=>set('openingHours',e.target.value)} placeholder="Ex. Samedi 16h–19h"/></div></div>
      <div className="grid gap-4 md:grid-cols-3"><input className={field} type="number" min="0" value={form.priceMin} onChange={e=>set('priceMin',e.target.value)} placeholder="Prix min"/><input className={field} type="number" min="0" value={form.priceMax} onChange={e=>set('priceMax',e.target.value)} placeholder="Prix max"/><input className={field} value={form.priceText} onChange={e=>set('priceText',e.target.value)} placeholder="Ex. À partir de 10 000 F"/></div>
      <div><p className="mb-2 text-xs font-bold text-gray-500">Pour qui ?</p><div className="flex flex-wrap gap-2">{PUBLICS.map(x=><button type="button" key={x.value} onClick={()=>set('suitableFor',toggle(form.suitableFor,x.value))} className={`rounded-full px-4 py-2 text-sm font-semibold ${form.suitableFor.includes(x.value)?'bg-solar text-white':'bg-gray-100 text-gray-600'}`}>{x.label}</button>)}</div></div>
      <div><p className="mb-2 text-xs font-bold text-gray-500">Meilleur moment</p><div className="flex flex-wrap gap-2">{MOMENTS.map(x=><button type="button" key={x} onClick={()=>set('bestMoment',toggle(form.bestMoment,x))} className={`rounded-full px-4 py-2 text-sm font-semibold ${form.bestMoment.includes(x)?'bg-anthracite text-white':'bg-gray-100 text-gray-600'}`}>{x}</button>)}</div></div>
      <div><label className="mb-1 block text-xs font-bold text-gray-500">Images</label><ImageUploader folder="experiences" entityId="new" images={images} onChange={setImages}/></div>
      <div className="grid gap-4 md:grid-cols-2"><input className={field} value={form.contactPhone} onChange={e=>set('contactPhone',e.target.value)} placeholder="Téléphone"/><input className={field} value={form.whatsapp} onChange={e=>set('whatsapp',e.target.value)} placeholder="WhatsApp"/><input className={field} value={form.bookingLink} onChange={e=>set('bookingLink',e.target.value)} placeholder="Lien de réservation"/><input className={field} value={form.tags} onChange={e=>set('tags',e.target.value)} placeholder="Tags séparés par des virgules"/></div>
      <button disabled={saving} className="w-full rounded-2xl bg-solar px-6 py-4 font-bold text-white hover:bg-orange-600 disabled:opacity-50">{saving?'Enregistrement…':'Soumettre l’expérience'}</button>
    </form></div>;
}
export default function Page(){return <main className="site-container py-10"><AuthGuard partnerOnly><Content/></AuthGuard></main>}
