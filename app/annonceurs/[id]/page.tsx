'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BadgeCheck, Building2, CalendarDays, MapPin, Sparkles } from 'lucide-react';
import ExperienceCard from '@/components/ExperienceCard';
import EstablishmentCard from '@/components/EstablishmentCard';
import EventCard from '@/components/EventCard';
import { getPublicPartnerContent } from '@/lib/partner-firestore';
import { Establishment, Experience, KiffEvent } from '@/types';

export default function PublicPartnerPage(){
  const { id } = useParams<{id:string}>();
  const [experiences,setExperiences]=useState<Experience[]>([]);
  const [establishments,setEstablishments]=useState<Establishment[]>([]);
  const [events,setEvents]=useState<KiffEvent[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{if(id)getPublicPartnerContent(id).then(data=>{setExperiences(data.experiences);setEstablishments(data.establishments);setEvents(data.events)}).finally(()=>setLoading(false))},[id]);
  const name=experiences[0]?.ownerName||establishments[0]?.ownerName||events[0]?.organizerName||'Créateur KIFFCI';
  const cities=useMemo(()=>Array.from(new Set([...experiences.map(x=>x.city),...establishments.map(x=>x.city),...events.map(x=>x.city)].filter(Boolean))),[experiences,establishments,events]);
  const verified=establishments.some(x=>x.isVerified);
  if(loading)return <main className="site-container py-20 text-center">Chargement de la vitrine…</main>;
  return <main className="pb-20">
    <section className="bg-anthracite text-white"><div className="site-container py-10 md:py-16"><Link href="/experiences" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft size={16}/>Retour aux expériences</Link><div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-solar">Vitrine créateur</p><div className="mt-3 flex flex-wrap items-center gap-3"><h1 className="font-display text-4xl font-bold md:text-6xl">{name}</h1>{verified&&<span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm font-bold"><BadgeCheck size={16} className="text-tropical"/>Vérifié</span>}</div><p className="mt-5 max-w-2xl text-white/70">Découvre les expériences proposées, les lieux qui les accueillent et les rendez-vous datés de cet créateur.</p>{cities.length>0&&<p className="mt-4 inline-flex items-center gap-2 text-sm text-white/60"><MapPin size={15}/>{cities.slice(0,4).join(' · ')}</p>}</div><div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-white/10"><Stat icon={Sparkles} value={experiences.length} label="expériences"/><Stat icon={Building2} value={establishments.length} label="lieux"/><Stat icon={CalendarDays} value={events.length} label="datées"/></div></div></div></section>
    <div className="site-container space-y-16 py-12">
      {experiences.length>0&&<section><SectionTitle eyebrow="À vivre" title="Ses expériences"/><div className="mt-7 grid gap-8 md:grid-cols-2 xl:grid-cols-3">{experiences.map(x=><ExperienceCard key={x.id} e={x}/>)}</div></section>}
      {establishments.length>0&&<section><SectionTitle eyebrow="Les supports" title="Ses établissements et activités"/><div className="mt-7 grid gap-8 md:grid-cols-2 xl:grid-cols-3">{establishments.map(x=><EstablishmentCard key={x.id} e={x}/>)}</div></section>}
      {events.length>0&&<section><SectionTitle eyebrow="À date fixe" title="Ses expériences datées"/><div className="mt-7 grid gap-8 md:grid-cols-2 xl:grid-cols-3">{events.map(x=><EventCard key={x.id} e={x}/>)}</div></section>}
      {!experiences.length&&!establishments.length&&!events.length&&<div className="rounded-[2rem] border border-gray-100 bg-white py-20 text-center"><Sparkles className="mx-auto text-solar" size={36}/><h2 className="mt-4 font-display text-2xl font-bold">Cette vitrine se prépare</h2><p className="mt-2 text-gray-500">Aucun contenu public n’est encore disponible.</p></div>}
    </div>
  </main>
}
function Stat({icon:Icon,value,label}:{icon:typeof Sparkles;value:number;label:string}){return <div className="min-w-24 bg-white/5 p-4 text-center"><Icon size={17} className="mx-auto text-solar"/><strong className="mt-2 block text-2xl">{value}</strong><span className="text-[11px] text-white/55">{label}</span></div>}
function SectionTitle({eyebrow,title}:{eyebrow:string;title:string}){return <div><p className="text-xs font-bold uppercase tracking-[.2em] text-solar">{eyebrow}</p><h2 className="mt-1 font-display text-3xl font-bold">{title}</h2></div>}
