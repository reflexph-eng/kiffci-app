'use client';
import { useEffect, useMemo, useState } from 'react';
import { Copy, Download, MessageCircle, QrCode, Share2, X } from 'lucide-react';

const QR_SERVICE_URL='https://api.qrserver.com/v1/create-qr-code/';
export default function CreatorSharePanel({creatorId,creatorName,publicPath}:{creatorId:string;creatorName:string;publicPath?:string}){
 const [open,setOpen]=useState(false); const [url,setUrl]=useState(''); const [message,setMessage]=useState('');
 useEffect(()=>{if(typeof window!=='undefined')setUrl(`${window.location.origin}${publicPath ?? `/annonceurs/${creatorId}`}`)},[creatorId,publicPath]);
 const qr=useMemo(()=>url?`${QR_SERVICE_URL}?${new URLSearchParams({size:'640x640',margin:'16',format:'png',data:url})}`:'',[url]);
 const text=`Découvre toutes les expériences proposées par ${creatorName} sur KIFFCI.`;
 async function copy(){await navigator.clipboard.writeText(url);setMessage('Lien copié.')}
 async function share(){if(navigator.share)await navigator.share({title:`${creatorName} sur KIFFCI`,text,url});else await copy()}
 async function download(){try{const r=await fetch(qr);const b=await r.blob();const o=URL.createObjectURL(b);const a=document.createElement('a');a.href=o;a.download=`qrcode-kiffci-${creatorId}.png`;a.click();URL.revokeObjectURL(o)}catch{window.open(qr,'_blank','noopener,noreferrer')}}
 return <>
  <button type="button" onClick={()=>setOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3 font-medium text-anthracite transition hover:border-solar hover:text-solar"><Share2 size={17}/>Partager ce créateur</button>
  {open&&<div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={`Partager ${creatorName}`}>
   <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-2xl sm:max-w-lg sm:rounded-[2rem]">
    <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-solar">Lien permanent KIFFCI</p><h2 className="mt-1 font-display text-2xl font-bold">Partager ce créateur</h2></div><button onClick={()=>setOpen(false)} className="rounded-full bg-gray-100 p-2" aria-label="Fermer"><X size={18}/></button></div>
    <div className="mx-auto mt-6 w-44 rounded-2xl border p-3">{qr?<img src={qr} alt={`QR Code de ${creatorName}`} className="w-full"/>:<div className="aspect-square animate-pulse bg-gray-100"/>}</div>
    <p className="mt-4 break-all rounded-2xl bg-gray-50 p-3 text-xs text-gray-600">{url}</p>
    <div className="mt-5 grid grid-cols-2 gap-3">
     <button onClick={download} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-anthracite px-4 py-3 text-sm font-bold text-white"><Download size={16}/>Télécharger</button>
     <button onClick={share} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-solar px-4 py-3 text-sm font-bold text-white"><Share2 size={16}/>Partage natif</button>
     <a href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-tropical px-4 py-3 text-sm font-bold text-white"><MessageCircle size={16}/>WhatsApp</a>
     <button onClick={copy} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-100 px-4 py-3 text-sm font-bold text-anthracite"><Copy size={16}/>Copier le lien</button>
    </div>{message&&<p className="mt-3 text-center text-sm font-semibold text-lagoon" role="status">{message}</p>}
   </div>
  </div>}
 </>
}
