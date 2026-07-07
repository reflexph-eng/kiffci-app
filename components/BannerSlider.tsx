'use client';
import { useCms } from '@/context/CmsContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function BannerSlider() {
  const { banners } = useCms();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const b = banners[idx];

  return (
    <div className="relative overflow-hidden rounded-[2rem] mx-4 md:mx-0 shadow-soft">
      <div
        className="h-48 md:h-64 bg-cover bg-center transition-all duration-500 relative"
        style={{ backgroundImage: `url(${b.imageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <h3 className="font-display font-bold text-white text-2xl md:text-3xl max-w-sm leading-tight">
            {b.title}
          </h3>
          {b.subtitle && (
            <p className="text-white/80 text-sm mt-2 max-w-xs">{b.subtitle}</p>
          )}
          {b.buttonText && b.buttonLink && (
            <Link
              href={b.buttonLink}
              className="mt-4 inline-flex items-center gap-2 bg-solar text-white px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-orange-600 transition w-fit"
            >
              {b.buttonText} →
            </Link>
          )}
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={() => setIdx(i => (i - 1 + banners.length) % banners.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-1.5 transition"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setIdx(i => (i + 1) % banners.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-1.5 transition"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-2 h-2 rounded-full transition ${i === idx ? 'bg-white' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
