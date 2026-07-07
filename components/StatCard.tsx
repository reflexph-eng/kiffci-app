interface Props {
  emoji: string;
  label: string;
  value: number | string;
  color?: string;
}
export default function StatCard({ emoji, label, value, color = 'text-solar' }: Props) {
  return (
    <div className="bg-white rounded-3xl shadow-card p-5 flex flex-col gap-1">
      <span className="text-2xl">{emoji}</span>
      <p className={`font-display font-bold text-3xl ${color}`}>
        {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
      </p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
