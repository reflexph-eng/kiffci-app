'use client';

import { ReactNode, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type HorizontalRailProps = {
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  ariaLabel?: string;
};

export default function HorizontalRail({
  children,
  className = '',
  trackClassName = '',
  ariaLabel = 'Contenu à faire défiler horizontalement',
}: HorizontalRailProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(direction: 'left' | 'right') {
    const track = trackRef.current;
    if (!track) return;
    const distance = Math.max(track.clientWidth * 0.82, 280);
    track.scrollBy({ left: direction === 'left' ? -distance : distance, behavior: 'smooth' });
  }

  const buttonBase = 'absolute top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center border border-gray-200 bg-white/95 text-anthracite shadow-sm transition hover:border-solar hover:text-solar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar focus-visible:ring-offset-2 sm:flex';

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => scroll('left')}
        aria-label="Faire défiler vers la gauche"
        className={`${buttonBase} left-1`}
      >
        <ChevronLeft size={18} strokeWidth={2.2} />
      </button>

      <div
        ref={trackRef}
        aria-label={ariaLabel}
        className={`scroll-smooth ${trackClassName}`}
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => scroll('right')}
        aria-label="Faire défiler vers la droite"
        className={`${buttonBase} right-1`}
      >
        <ChevronRight size={18} strokeWidth={2.2} />
      </button>
    </div>
  );
}
