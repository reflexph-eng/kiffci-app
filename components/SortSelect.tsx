'use client';
import { ArrowUpDown } from 'lucide-react';

export type SortOption = { value: string; label: string };

interface Props {
  value: string;
  onChange: (v: string) => void;
  options: SortOption[];
}

export default function SortSelect({ value, onChange, options }: Props) {
  return (
    <div className="relative">
      <ArrowUpDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden />
      <select value={value} onChange={e => onChange(e.target.value)} aria-label="Trier par"
        className="pl-10 pr-8 py-2.5 rounded-2xl border border-gray-200 focus:border-solar outline-none text-sm bg-white appearance-none">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
