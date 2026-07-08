'use client';
import { useState } from 'react';
import {
  HIGHLIGHT_BADGES, HIGHLIGHT_SECTIONS, HIGHLIGHT_STATUSES,
  dateInputToTimestamp, timestampToDateInput, HighlightPatch,
} from '@/lib/highlights';
import { updateHighlight } from '@/lib/highlights-firestore';
import { HighlightBadge, HighlightSection, HighlightStatus } from '@/types';
import { X, Sparkles } from 'lucide-react';

interface Props {
  kind: 'establishment' | 'event' | 'experience';
  targetId: string;
  targetName: string;
  initial: HighlightPatch;
  actorId: string;
  actorName: string;
  onClose: () => void;
  onSaved: (patch: HighlightPatch) => void;
}

export default function HighlightModal({ kind, targetId, targetName, initial, actorId, actorName, onClose, onSaved }: Props) {
  const [badge, setBadge]       = useState<HighlightBadge>(initial.highlightBadge ?? 'none');
  const [status, setStatus]     = useState<HighlightStatus>(initial.highlightStatus ?? 'inactive');
  const [sections, setSections] = useState<HighlightSection[]>(initial.highlightSections ?? []);
  const [rank, setRank]         = useState(initial.highlightRank ?? 100);
  const [startDate, setStartDate] = useState(timestampToDateInput(initial.highlightStartAt ?? undefined));
  const [endDate, setEndDate]     = useState(timestampToDateInput(initial.highlightEndAt ?? undefined));
  const [saving, setSaving]     = useState(false);

  function toggleSection(s: HighlightSection) {
    setSections(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  async function handleSave() {
    setSaving(true);
    const patch: HighlightPatch = {
      highlightType: badge === 'sponsored' ? 'sponsored' : 'editorial',
      highlightBadge: badge,
      highlightStatus: status,
      highlightSections: sections,
      highlightRank: rank,
      highlightStartAt: dateInputToTimestamp(startDate) ?? undefined,
      highlightEndAt: dateInputToTimestamp(endDate) ?? undefined,
    };
    await updateHighlight(kind, targetId, targetName, patch, actorId, actorName);
    onSaved(patch);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display font-bold text-lg flex items-center gap-2">
            <Sparkles size={18} className="text-solar" aria-hidden /> Mise en avant
          </h2>
          <button onClick={onClose} aria-label="Fermer" className="text-gray-400 hover:text-gray-600">
            <X size={18} aria-hidden />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-5">{targetName}</p>

        <label className="block mb-4">
          <span className="text-sm font-medium text-gray-700">Badge affiché</span>
          <select value={badge} onChange={e => setBadge(e.target.value as HighlightBadge)}
            className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm bg-white">
            {HIGHLIGHT_BADGES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </label>

        <label className="block mb-4">
          <span className="text-sm font-medium text-gray-700">Statut</span>
          <select value={status} onChange={e => setStatus(e.target.value as HighlightStatus)}
            className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm bg-white">
            {HIGHLIGHT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <span className="block text-xs text-gray-400 mt-1">Seul le statut « Active » rend le badge visible sur le site.</span>
        </label>

        <div className="mb-4">
          <span className="text-sm font-medium text-gray-700 block mb-2">Apparaît dans ces rubriques homepage</span>
          <div className="flex flex-wrap gap-2">
            {HIGHLIGHT_SECTIONS.map(s => (
              <button key={s.value} type="button" onClick={() => toggleSection(s.value)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                  sections.includes(s.value) ? 'bg-solar text-white border-solar' : 'bg-white text-gray-600 border-gray-200 hover:border-solar/40'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Début (optionnel)</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Fin (optionnel)</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm" />
          </label>
        </div>

        <label className="block mb-6">
          <span className="text-sm font-medium text-gray-700">Rang d'affichage (plus petit = prioritaire)</span>
          <input type="number" value={rank} onChange={e => setRank(Number(e.target.value))}
            className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm" />
        </label>

        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving}
            className="bg-solar text-white font-medium px-5 py-2.5 rounded-2xl hover:bg-orange-600 transition text-sm disabled:opacity-50">
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <button onClick={onClose}
            className="bg-gray-100 text-gray-600 font-medium px-5 py-2.5 rounded-2xl hover:bg-gray-200 transition text-sm">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
