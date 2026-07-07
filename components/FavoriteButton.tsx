'use client';
import { Heart } from 'lucide-react';
import { useFavorite } from '@/hooks/useFavorite';
import { useRouter } from 'next/navigation';

export default function FavoriteButton({ experienceId }: { experienceId: string }) {
  const { isFav, toggle, toggling, loggedIn } = useFavorite(experienceId);
  const router = useRouter();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (!loggedIn) { router.push('/login'); return; }
    toggle();
  }

  return (
    <button
      onClick={handleClick}
      disabled={toggling}
      aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={`p-2 rounded-full transition-all ${
        isFav
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-white/80 text-gray-400 hover:text-red-400 hover:bg-red-50'
      } shadow-sm`}
    >
      <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
    </button>
  );
}
