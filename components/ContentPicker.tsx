'use client';
/**
 * ContentPicker — sélecteur visuel de contenus (Sprint 2).
 * Remplace la saisie d'IDs Firestore à la main : recherche + vignettes,
 * réutilisable partout (rubriques, réglages homepage, campagnes).
 */
import { useEffect, useMemo, useState } from 'react';
import { Search, X, Check, GripVertical } from 'lucide-react';
import { getExperiences } from '@/lib/firestore';
import { getApprovedEstablishments, getApprovedEvents } from '@/lib/partner-firestore';
import { Experience, Establishment, KiffEvent, SectionContentType } from '@/types';

type Item = { id: string; title: string; subtitle: string; image: string };

function normalize(contentType: SectionContentType, list: (Experience | Establishment | KiffEvent)[]): Item[] {
  if (contentType === 'experiences') {
    return (list as Experience[]).map(e => ({ id: e.id, title: e.title, subtitle: `${e.city} · ${e.category}`, image: e.images[0] ?? '' }));
  }
  if (contentType === 'establishments') {
    return (list as Establishment[]).map(e => ({ id: e.id, title: e.name, subtitle: `${e.city} · ${e.category}`, image: e.images[0] ?? '' }));
  }
  return (list as KiffEvent[]).map(e => ({ id: e.id, title: e.title, subtitle: `${e.city} · ${e.startDate.slice(0, 10)}`, image: e.images[0] ?? '' }));
}

interface Props {
  contentType: SectionContentType;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  maxItems?: number;
}

export default function ContentPicker({ contentType, selectedIds, onChange, maxItems = 12 }: Props) {
  const [items, setItems]   = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ]            = useState('');
  const [open, setOpen]      = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetcher =
      contentType === 'experiences'    ? getExperiences() :
      contentType === 'establishments' ? getApprovedEstablishments() :
      getApprovedEvents();
    fetcher.then(list => setItems(normalize(contentType, list))).finally(() => setLoading(false));
  }, [contentType]);

  const byId = useMemo(() => new Map(items.map(i => [i.id, i])), [items]);
  const selected = selectedIds.map(id => byId.get(id)).filter(Boolean) as Item[];

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return items.filter(i => !selectedIds.includes(i.id) && (!text || `${i.title} ${i.subtitle}`.toLowerCase().includes(text)));
  }, [items, q, selectedIds]);

  function add(id: string) {
    if (selectedIds.length >= maxItems) return;
    onChange([...selectedIds, id]);
  }
  function remove(id: string) {
    onChange(selectedIds.filter(x => x !== id));
  }
  function move(index: number, dir: -1 | 1) {
    const next = [...selectedIds];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      {/* Sélection actuelle */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selected.map((item, i) => (
            <div key={item.id} className="flex items-center gap-2 bg-solar/10 border border-solar/20 rounded-2xl pl-2 pr-3 py-1.5">
              <GripVertical size={13} className="text-gray-300" aria-hidden />
              {item.image
                ? <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                : <div className="w-8 h-8 rounded-lg bg-sand" />}
              <span className="text-xs font-medium text-anthracite max-w-[140px] truncate">{item.title}</span>
              <div className="flex flex-col -my-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                  className="text-[9px] text-gray-400 hover:text-solar disabled:opacity-20" aria-label="Monter">▲</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === selected.length - 1}
                  className="text-[9px] text-gray-400 hover:text-solar disabled:opacity-20" aria-label="Descendre">▼</button>
              </div>
              <button type="button" onClick={() => remove(item.id)} aria-label={`Retirer ${item.title}`}
                className="text-gray-400 hover:text-red-500">
                <X size={13} aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Ouvrir le sélecteur */}
      {!open ? (
        <button type="button" onClick={() => setOpen(true)}
          className="text-sm font-medium text-solar hover:underline flex items-center gap-1.5">
          <Search size={14} aria-hidden /> {selected.length > 0 ? 'Ajouter un élément' : 'Choisir des éléments'}
        </button>
      ) : (
        <div className="border border-gray-200 rounded-2xl p-3">
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)}
              placeholder="Rechercher par nom, ville, catégorie…"
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm" />
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} aria-hidden />
            </button>
          </div>
          {loading ? (
            <p className="text-xs text-gray-400 px-1">Chargement…</p>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-1">
              {filtered.length === 0 && <p className="text-xs text-gray-400 px-1 py-2">Aucun résultat.</p>}
              {filtered.slice(0, 30).map(item => (
                <button key={item.id} type="button" onClick={() => add(item.id)}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 text-left">
                  {item.image
                    ? <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    : <div className="w-10 h-10 rounded-lg bg-sand shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-anthracite truncate">{item.title}</p>
                    <p className="text-xs text-gray-400 truncate">{item.subtitle}</p>
                  </div>
                  <Check size={14} className="ml-auto text-gray-200 shrink-0" aria-hidden />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
