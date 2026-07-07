import { Status } from '@/types';

const CONFIG = {
  pending:  { label: 'En attente',  bg: 'bg-yellow-100', text: 'text-yellow-800' },
  approved: { label: 'Approuvé',    bg: 'bg-green-100',  text: 'text-green-800'  },
  rejected: { label: 'Rejeté',      bg: 'bg-red-100',    text: 'text-red-800'    },
};

export default function StatusBadge({ status }: { status: Status }) {
  const { label, bg, text } = CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${bg} ${text}`}>
      {status === 'pending'  && '⏳'}
      {status === 'approved' && '✅'}
      {status === 'rejected' && '❌'}
      {label}
    </span>
  );
}
