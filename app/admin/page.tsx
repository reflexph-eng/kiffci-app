'use client';
import { useEffect, useState, useRef } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import {
  getAllExperiencesAdmin, createExperience, updateExperience, deleteExperience,
  getChallenges, createChallenge, updateChallenge, deleteChallenge, seedDemoData,
} from '@/lib/firestore';
import { getPendingEstablishments, getPendingEvents, getApprovedEstablishments } from '@/lib/partner-firestore';
import { seedCmsData } from '@/lib/cms-firestore';
import { uploadImage } from '@/lib/storage';
import { Experience, Challenge, Establishment } from '@/types';
import { experiences as demoExperiences, challenges as demoChallenges } from '@/data/experiences';
import {
  Plus, Edit2, Trash2, Search, BarChart3, Upload, X, Check,
  Database, Shield, Settings, Image, Tag, Megaphone, ArrowRight, FileText, PanelBottom, LayoutGrid, Megaphone as Megaphone2, Menu as MenuIcon, Users as Users2, Sparkles as Sparkles2, MessageSquare as MsgSquare, BarChart3 as BarChart3b, Gift as Gift2,
} from 'lucide-react';
import Link from 'next/link';

type Tab = 'experiences' | 'challenges';

const CHALLENGE_TYPE_LABELS: Record<Challenge['type'], string> = {
  decouverte: 'Découverte', frequence: 'Fréquence', saisonnier: 'Saisonnier', communautaire: 'Communautaire',
};

const EMPTY_EXP: Omit<Experience, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '', description: '', category: '', mood: [],
  city: 'Abidjan', district: '', latitude: 5.354, longitude: -4.008,
  duration: '', priceMin: 0, priceMax: 0, priceText: '',
  openingHours: '', contactPhone: '', whatsapp: '', email: '',
  images: [], tags: [], suitableFor: [],
  bestMoment: [], isFree: false, isPremium: false, isSponsored: false, isPublished: true,
};

function AdminContent() {
  const { appUser } = useAuth();
  const [tab,          setTab]          = useState<Tab>('experiences');
  const [exps,         setExps]         = useState<Experience[]>([]);
  const [approvedEsts, setApprovedEsts] = useState<Establishment[]>([]);
  const [challenges,   setChallenges]   = useState<Challenge[]>([]);
  const [search,       setSearch]       = useState('');
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [toast,        setToast]        = useState('');
  const [toastType,    setToastType]    = useState<'ok'|'err'>('ok');
  const [editingExp,   setEditingExp]   = useState<Partial<Experience> | null>(null);
  const [editingCh,    setEditingCh]    = useState<Partial<Challenge>  | null>(null);
  const [confirmDel,   setConfirmDel]   = useState<string | null>(null);
  const [seeding,      setSeeding]      = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string, type: 'ok'|'err' = 'ok') {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(''), 3500);
  }

  async function reload() {
    const [e, c] = await Promise.all([getAllExperiencesAdmin(), getChallenges()]);
    setExps(e); setChallenges(c);
  }

  useEffect(() => {
    Promise.all([reload(), getPendingEstablishments(), getPendingEvents(), getApprovedEstablishments()])
      .then(([, ests, evts, approved]) => { setPendingCount(ests.length + evts.length); setApprovedEsts(approved); })
      .finally(() => setLoading(false));
  }, []);

  async function saveExp() {
    if (!editingExp?.title || !editingExp?.category) { showToast('Titre et catégorie requis.', 'err'); return; }
    setSaving(true);
    try {
      if (editingExp.id) {
        const { id, createdAt, updatedAt, ...data } = editingExp as Experience;
        await updateExperience(id, data);
        showToast('Expérience mise à jour ✓');
      } else {
        await createExperience(editingExp as Omit<Experience, 'id'|'createdAt'|'updatedAt'>);
        showToast('Expérience créée ✓');
      }
      setEditingExp(null); await reload();
    } catch { showToast('Erreur.', 'err'); }
    finally { setSaving(false); }
  }

  async function deleteExp(id: string) {
    setSaving(true);
    try { await deleteExperience(id); showToast('Supprimée'); setConfirmDel(null); await reload(); }
    catch { showToast('Erreur.', 'err'); }
    finally { setSaving(false); }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editingExp) return;
    const tempId = editingExp.id ?? `temp_${Date.now()}`;
    setUploadingImg(true);
    try {
      const url = await uploadImage('experiences', tempId, file);
      setEditingExp(p => ({ ...p, images: [...(p?.images ?? []), url] }));
      showToast('Image uploadée ✓');
    } catch { showToast('Erreur upload.', 'err'); }
    finally { setUploadingImg(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  async function saveCh() {
    if (!editingCh?.title) { showToast('Titre requis.', 'err'); return; }
    setSaving(true);
    try {
      if (editingCh.id) { const { id, ...data } = editingCh as Challenge; await updateChallenge(id, data); showToast('Défi mis à jour ✓'); }
      else { await createChallenge(editingCh as Omit<Challenge,'id'>); showToast('Défi créé ✓'); }
      setEditingCh(null); await reload();
    } catch { showToast('Erreur.', 'err'); }
    finally { setSaving(false); }
  }

  async function deleteCh(id: string) {
    setSaving(true);
    try { await deleteChallenge(id); showToast('Défi supprimé'); setConfirmDel(null); await reload(); }
    catch { showToast('Erreur.', 'err'); }
    finally { setSaving(false); }
  }

  async function handleSeed() {
    if (!confirm('Injecter les données démo (expériences + défis + CMS) ?')) return;
    setSeeding(true);
    try {
      const expData = demoExperiences.map(({ id: _id, ...rest }) => ({ ...rest, isPublished: true }));
      const chData  = demoChallenges.map(({ id: _id, ...rest }) => rest);
      await Promise.all([seedDemoData(expData, chData), seedCmsData()]);
      showToast('Données injectées ✓'); await reload();
    } catch { showToast('Erreur seed.', 'err'); }
    finally { setSeeding(false); }
  }

  const stats = [
    { label: 'Expériences',  value: exps.length,                               color: 'text-solar' },
    { label: 'Gratuites',    value: exps.filter(e => e.isFree).length,          color: 'text-tropical' },
    { label: 'Premium',      value: exps.filter(e => e.isPremium).length,       color: 'text-purple-600' },
    { label: 'Non publiées', value: exps.filter(e => !e.isPublished).length,    color: 'text-yellow-600' },
  ];

  const filteredExps = exps.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.city.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center mt-20"><div className="w-10 h-10 border-4 border-solar border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-2xl shadow-soft font-semibold animate-fadeUp ${toastType === 'ok' ? 'bg-anthracite text-white' : 'bg-red-600 text-white'}`}>
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-4xl text-anthracite">Dashboard Admin</h1>
          <p className="text-gray-500 mt-1">Connecté : <strong>{appUser?.email}</strong></p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {pendingCount > 0 && (
            <Link href="/admin/moderation"
              className="flex items-center gap-2 bg-orange-50 border border-solar/30 text-solar px-4 py-2.5 rounded-2xl text-sm font-bold hover:bg-orange-100 transition">
              <Shield size={16} /> Modération ({pendingCount})
            </Link>
          )}
          <button onClick={handleSeed} disabled={seeding}
            className="flex items-center gap-2 bg-anthracite text-white px-4 py-2.5 rounded-2xl text-sm font-bold hover:bg-gray-800 transition disabled:opacity-60">
            {seeding ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Database size={16} />}
            Seed données démo
          </button>
        </div>
      </div>

      {/* ── Navigation admin — groupée en listes, plus de grille de tuiles ── */}
      <div className="mb-10 space-y-7">
        {[
          {
            title: 'Contenu du site',
            items: [
              { href: '/admin/settings', icon: Settings,    label: 'Paramètres', sub: 'Hero, slogan, maintenance', color: 'text-solar bg-solar/10' },
              { href: '/admin/banners',  icon: Image,       label: 'Bannières',  sub: 'Affichage accueil',         color: 'text-blue-600 bg-blue-50' },
              { href: '/admin/pages',    icon: FileText,    label: 'Pages du site', sub: 'À propos, CGU, FAQ…',    color: 'text-anthracite bg-gray-100' },
              { href: '/admin/footer',   icon: PanelBottom, label: 'Footer',     sub: 'Contacts & réseaux',        color: 'text-lagoon bg-lagoon/10' },
              { href: '/admin/menu',     icon: MenuIcon,    label: 'Menu',       sub: 'Navigation publique',       color: 'text-blue-600 bg-blue-50' },
            ],
          },
          {
            title: 'Homepage & publicité',
            items: [
              { href: '/admin/categories', icon: Tag,        label: 'Catégories', sub: 'Ordre & visibilité',        color: 'text-purple-600 bg-purple-50' },
              { href: '/admin/campaigns',  icon: Megaphone,  label: 'Campagnes',  sub: 'Promos & highlights',       color: 'text-tropical bg-tropical/10' },
              { href: '/admin/sections',   icon: LayoutGrid, label: 'Rubriques',  sub: 'Sections de la homepage',   color: 'text-purple-600 bg-purple-50' },
              { href: '/admin/ads',        icon: Megaphone2, label: 'Publicité',  sub: '5 emplacements pilotables', color: 'text-pink-600 bg-pink-50' },
            ],
          },
          {
            title: 'Modération & confiance',
            items: [
              { href: '/admin/moderation', icon: Shield,    label: 'Modération',  sub: 'Partenaires en attente',     color: 'text-orange-600 bg-orange-50' },
              { href: '/admin/reviews',    icon: MsgSquare, label: 'Avis',        sub: 'Modération & signalements',  color: 'text-lagoon bg-lagoon/10' },
              { href: '/admin/users',      icon: Users2,    label: 'Utilisateurs', sub: 'Rôles & suspensions',       color: 'text-anthracite bg-gray-100' },
            ],
          },
          {
            title: 'Croissance & monétisation',
            items: [
              { href: '/admin/partners', icon: Sparkles2,  label: 'Premium & Sponsorisé', sub: 'Monétisation',        color: 'text-solar bg-solar/10' },
              { href: '/admin/stats',    icon: BarChart3b, label: 'Observatoire',         sub: "Statistiques d'ensemble", color: 'text-anthracite bg-gray-100' },
              { href: '/admin/raffle',   icon: Gift2,      label: 'Tirage au sort',       sub: 'Récompenses mensuelles',  color: 'text-solar bg-solar/10' },
            ],
          },
        ].map(group => (
          <div key={group.title}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{group.title}</p>
            <div className="border border-gray-100 rounded-2xl divide-y divide-gray-100 overflow-hidden bg-white">
              {group.items.map(({ href, icon: Icon, label, sub, color }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-anthracite">{label}</p>
                    <p className="text-xs text-gray-400 truncate">{sub}</p>
                  </div>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-solar group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Stats expériences — barre inline, séparateurs plutôt que cartes */}
      <div className="flex items-center gap-8 overflow-x-auto py-5 border-y border-gray-100 mb-6">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="flex flex-col gap-0.5 shrink-0">
            <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['experiences', 'challenges'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition capitalize ${tab === t ? 'bg-solar text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            {t === 'experiences' ? `Expériences (${exps.length})` : `Défis (${challenges.length})`}
          </button>
        ))}
      </div>

      {tab === 'experiences' && (
        <div className="grid md:grid-cols-[.85fr_1.15fr] gap-8">
          <div className="bg-white rounded-4xl shadow-card p-6 space-y-4 h-fit">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-xl flex items-center gap-2">
                <Plus size={20} className="text-solar" /> {editingExp?.id ? 'Modifier' : 'Ajouter'}
              </h2>
              {editingExp && <button onClick={() => setEditingExp(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>}
            </div>
            {!editingExp ? (
              <button onClick={() => setEditingExp({ ...EMPTY_EXP })}
                className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-8 text-gray-400 hover:border-solar hover:text-solar transition font-medium">
                + Nouvelle expérience
              </button>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {([
                  ['title','Titre *','text'],['category','Catégorie *','text'],['city','Ville','text'],
                  ['district','District','text'],['priceText','Tarif','text'],['priceMin','Prix min','number'],
                  ['priceMax','Prix max','number'],['openingHours','Horaires','text'],
                  ['contactPhone','Téléphone','text'],['whatsapp','WhatsApp','text'],
                  ['email','Email','email'],['duration','Durée','text'],
                  ['latitude','Latitude','number'],['longitude','Longitude','number'],
                ] as [keyof Experience, string, string][]).map(([field, label, type]) => (
                  <div key={field}>
                    <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
                    <input type={type} value={(editingExp[field] as string | number) ?? ''}
                      onChange={e => setEditingExp(p => ({ ...p, [field]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                      className="w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 focus:border-solar" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                  <textarea rows={3} value={editingExp.description ?? ''}
                    onChange={e => setEditingExp(p => ({ ...p, description: e.target.value }))}
                    className="w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Tags (virgule)</label>
                  <input type="text" value={(editingExp.tags ?? []).join(', ')}
                    onChange={e => setEditingExp(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                    className="w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Moods (virgule)</label>
                  <input type="text" value={(editingExp.mood ?? []).join(', ')}
                    onChange={e => setEditingExp(p => ({ ...p, mood: e.target.value.split(',').map(m => m.trim()).filter(Boolean) }))}
                    className="w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30" />
                </div>
                <div className="flex flex-wrap gap-4 py-2">
                  {(['isFree','isPremium','isSponsored','isPublished'] as (keyof Experience)[]).map(field => (
                    <label key={field} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={!!editingExp[field]}
                        onChange={e => setEditingExp(p => ({ ...p, [field]: e.target.checked }))}
                        className="rounded accent-orange-500" />
                      {field}
                    </label>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    Établissement lié (pour le code de passage certifié)
                  </label>
                  <select value={editingExp.linkedEstablishmentId ?? ''}
                    onChange={e => setEditingExp(p => ({ ...p, linkedEstablishmentId: e.target.value || undefined }))}
                    className="w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 bg-white">
                    <option value="">— Aucun (déclaration libre uniquement) —</option>
                    {approvedEsts.map(est => <option key={est.id} value={est.id}>{est.name}</option>)}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Si lié, les visiteurs pourront certifier leur passage avec le code affiché par ce partenaire (bonus de points).
                  </p>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox"
                      checked={!!editingExp.earlyAccessUntil && editingExp.earlyAccessUntil > Date.now()}
                      onChange={e => setEditingExp(p => ({
                        ...p,
                        earlyAccessUntil: e.target.checked ? Date.now() + 24 * 3600 * 1000 : undefined,
                      }))}
                      className="rounded accent-orange-500" />
                    Accès prioritaire 24h (réservé aux niveaux Aventurier+)
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">Images</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(editingExp.images ?? []).map(url => (
                      <div key={url} className="relative w-14 h-14 rounded-xl overflow-hidden group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => setEditingExp(p => ({ ...p, images: (p?.images ?? []).filter(u => u !== url) }))}
                          className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingImg}
                    className="flex items-center gap-2 border border-dashed border-gray-300 rounded-2xl px-4 py-2 text-sm text-gray-500 hover:border-solar hover:text-solar transition">
                    {uploadingImg ? <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <Upload size={14} />}
                    Uploader
                  </button>
                </div>
                <button onClick={saveExp} disabled={saving}
                  className="w-full bg-solar text-white rounded-2xl py-3 font-bold hover:bg-orange-600 transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={18} />}
                  {editingExp.id ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            )}
          </div>
          <div className="bg-white rounded-4xl shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl flex items-center gap-2"><BarChart3 size={20} className="text-solar" /> Expériences ({filteredExps.length})</h2>
            </div>
            <div className="relative mb-4">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filtrer…"
                className="w-full border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30" />
            </div>
            <div className="divide-y max-h-[600px] overflow-auto pr-1">
              {filteredExps.map(e => (
                <div key={e.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{e.title}</p>
                    <p className="text-xs text-gray-400">{e.city} · {e.category}{!e.isPublished && ' · 🔒'}{e.isPremium && ' · ⭐'}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => setEditingExp(e)} className="p-2 rounded-xl text-gray-400 hover:bg-solar/10 hover:text-solar transition"><Edit2 size={15} /></button>
                    {confirmDel === e.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => deleteExp(e.id)} className="px-2 py-1 bg-red-600 text-white rounded-xl text-xs font-bold">Oui</button>
                        <button onClick={() => setConfirmDel(null)} className="px-2 py-1 bg-gray-100 rounded-xl text-xs">Non</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDel(e.id)} className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition"><Trash2 size={15} /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'challenges' && (
        <div className="grid md:grid-cols-[.9fr_1.1fr] gap-8">
          <div className="bg-white rounded-4xl shadow-card p-6 space-y-4 h-fit">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-xl flex items-center gap-2"><Plus size={20} className="text-solar" /> {editingCh?.id ? 'Modifier' : 'Nouveau'} défi</h2>
              {editingCh && <button onClick={() => setEditingCh(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>}
            </div>
            {!editingCh ? (
              <button onClick={() => setEditingCh({ title:'', description:'', rewardPoints:500, experiences:[], category:'', type:'decouverte', isActive:true })}
                className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-8 text-gray-400 hover:border-solar hover:text-solar transition font-medium">
                + Nouveau défi
              </button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Type de défi</label>
                  <select value={editingCh.type ?? 'decouverte'}
                    onChange={e => setEditingCh(p => ({ ...p, type: e.target.value as Challenge['type'] }))}
                    className="w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 bg-white">
                    <option value="decouverte">Découverte — checklist d'expériences</option>
                    <option value="frequence">Fréquence — revenir chez un partenaire</option>
                    <option value="saisonnier">Saisonnier — limité dans le temps</option>
                    <option value="communautaire">Communautaire — avec classement</option>
                  </select>
                </div>

                {[['title','Titre *'],['category','Catégorie'],['description','Description']].map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
                    {field === 'description'
                      ? <textarea rows={3} value={(editingCh[field as keyof Challenge] as string) ?? ''}
                          onChange={e => setEditingCh(p => ({ ...p, [field]: e.target.value }))}
                          className="w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 resize-none" />
                      : <input type="text" value={(editingCh[field as keyof Challenge] as string) ?? ''}
                          onChange={e => setEditingCh(p => ({ ...p, [field]: e.target.value }))}
                          className="w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30" />
                    }
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Points de récompense</label>
                  <input type="number" value={editingCh.rewardPoints ?? 500}
                    onChange={e => setEditingCh(p => ({ ...p, rewardPoints: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30" />
                </div>

                {editingCh.type === 'frequence' ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Établissement ciblé</label>
                      <select value={editingCh.targetEstablishmentId ?? ''}
                        onChange={e => {
                          const est = approvedEsts.find(x => x.id === e.target.value);
                          setEditingCh(p => ({ ...p, targetEstablishmentId: e.target.value || undefined, targetEstablishmentName: est?.name }));
                        }}
                        className="w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30 bg-white">
                        <option value="">— Choisir —</option>
                        {approvedEsts.map(est => <option key={est.id} value={est.id}>{est.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Nombre de visites requises</label>
                      <input type="number" min={2} value={editingCh.requiredVisits ?? 3}
                        onChange={e => setEditingCh(p => ({ ...p, requiredVisits: Number(e.target.value) }))}
                        className="w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30" />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">IDs d'expériences (virgule)</label>
                    <input type="text" value={(editingCh.experiences ?? []).join(', ')}
                      onChange={e => setEditingCh(p => ({ ...p, experiences: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                      className="w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30" />
                  </div>
                )}

                {(editingCh.type === 'saisonnier' || editingCh.type === 'frequence') && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Début {editingCh.type === 'saisonnier' && '*'}</label>
                      <input type="date" value={editingCh.startDate ?? ''}
                        onChange={e => setEditingCh(p => ({ ...p, startDate: e.target.value }))}
                        className="w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Fin {editingCh.type === 'saisonnier' && '*'}</label>
                      <input type="date" value={editingCh.endDate ?? ''}
                        onChange={e => setEditingCh(p => ({ ...p, endDate: e.target.value }))}
                        className="w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-solar/30" />
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm cursor-pointer pt-1">
                  <input type="checkbox" checked={editingCh.isActive ?? true}
                    onChange={e => setEditingCh(p => ({ ...p, isActive: e.target.checked }))}
                    className="rounded accent-orange-500" />
                  Défi actif
                </label>

                <button onClick={saveCh} disabled={saving}
                  className="w-full bg-solar text-white rounded-2xl py-3 font-bold hover:bg-orange-600 transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={18} />}
                  {editingCh.id ? 'Mettre à jour' : 'Créer le défi'}
                </button>
              </div>
            )}
          </div>
          <div className="bg-white rounded-4xl shadow-card p-6">
            <h2 className="font-display font-bold text-xl mb-4">Défis ({challenges.length})</h2>
            <div className="divide-y">
              {challenges.map(c => (
                <div key={c.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm flex items-center gap-2">
                      {c.title}
                      {!c.isActive && <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Inactif</span>}
                    </p>
                    <p className="text-xs text-gray-400">
                      {CHALLENGE_TYPE_LABELS[c.type]} · {c.category} · {c.rewardPoints} pts
                      {c.type === 'frequence'
                        ? ` · ${c.requiredVisits ?? 0} visites chez ${c.targetEstablishmentName ?? '—'}`
                        : ` · ${c.experiences.length} expérience(s)`}
                      {c.endDate && ` · jusqu'au ${new Date(c.endDate).toLocaleDateString('fr-FR')}`}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => setEditingCh(c)} className="p-2 rounded-xl text-gray-400 hover:bg-solar/10 hover:text-solar transition"><Edit2 size={15} /></button>
                    {confirmDel === c.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => deleteCh(c.id)} className="px-2 py-1 bg-red-600 text-white rounded-xl text-xs font-bold">Oui</button>
                        <button onClick={() => setConfirmDel(null)} className="px-2 py-1 bg-gray-100 rounded-xl text-xs">Non</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDel(c.id)} className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition"><Trash2 size={15} /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <AuthGuard adminOnly>
        <AdminContent />
      </AuthGuard>
    </main>
  );
}
