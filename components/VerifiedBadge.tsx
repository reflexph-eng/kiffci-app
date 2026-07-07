import { BadgeCheck } from 'lucide-react';

export default function VerifiedBadge({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'text-sm px-3 py-1.5 gap-1.5' : 'text-xs px-2.5 py-1 gap-1';
  return (
    <span className={`inline-flex items-center ${cls} bg-lagoon text-white font-bold rounded-full`}>
      <BadgeCheck size={size === 'md' ? 15 : 12} aria-hidden /> Vérifié KiffCI
    </span>
  );
}
