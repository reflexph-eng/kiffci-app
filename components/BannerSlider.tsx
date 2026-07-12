"use client";

import { useCms } from "@/context/CmsContext";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BannerSlider() {
  const { banners, settings } = useCms();
  const [idx, setIdx] = useState(0);

  const slides = useMemo(() => {
    if (banners.length > 0) return banners;
    return [
      {
        id: "homepage-fallback",
        title: settings.heroTitle || "Que veux-tu vivre aujourd'hui ?",
        subtitle:
          settings.heroSubtitle ||
          "Les meilleures expériences à vivre en Côte d'Ivoire.",
        imageUrl:
          settings.heroImageUrl ||
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=82",
        buttonText: settings.heroButtonText || "Découvrir",
        buttonLink: settings.heroButtonLink || "/experiences",
        textColor: '#FFFFFF',
        buttonBgColor: '#E89A16',
        buttonTextColor: '#FFFFFF',
        position: 1,
        isActive: true,
        startDate: "",
        endDate: "",
        createdAt: 0,
      },
    ];
  }, [banners, settings]);

  useEffect(() => {
    if (idx >= slides.length) setIdx(0);
  }, [idx, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIdx((current) => (current + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const slide = slides[idx];

  function previous() {
    setIdx((current) => (current - 1 + slides.length) % slides.length);
  }

  function next() {
    setIdx((current) => (current + 1) % slides.length);
  }

  return (
    <section
      aria-label="À la une"
      className="site-container pt-3 sm:pt-4"
    >
      <div className="group relative min-h-[260px] overflow-hidden rounded-md bg-anthracite sm:min-h-[280px] lg:min-h-[300px] xl:min-h-[320px]">
        <div
          key={slide.id}
          className="absolute inset-0 animate-fadeUp bg-cover bg-center"
          style={{ backgroundImage: `url(${slide.imageUrl})` }}
          role="img"
          aria-label={slide.title}
        />
        <div className="absolute inset-0 bg-black/38" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/72 via-black/32 to-transparent"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/35 to-transparent"
          aria-hidden="true"
        />

        <div className="relative flex min-h-[260px] items-center px-7 py-8 sm:min-h-[280px] sm:px-12 lg:min-h-[300px] lg:px-16 xl:min-h-[320px]"
          style={{ color: slide.textColor || "#FFFFFF" }}>
          <div className="max-w-xl">
            <h1 className="font-display text-[clamp(1.85rem,3.4vw,3.5rem)] font-bold leading-[1.04] tracking-[-0.035em]">
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className="mt-3 max-w-lg text-sm leading-relaxed opacity-90 sm:text-base">
                {slide.subtitle}
              </p>
            )}
            {slide.buttonText && slide.buttonLink && (
              <Link
                href={slide.buttonLink}
                className="mt-5 inline-flex min-h-11 items-center px-6 py-3 text-sm font-bold transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                style={{
                  backgroundColor: slide.buttonBgColor || "#E89A16",
                  color: slide.buttonTextColor || "#FFFFFF",
                }}
              >
                {slide.buttonText}
              </Link>
            )}
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={previous}
              aria-label="Afficher la bannière précédente"
              className="absolute left-3 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-anthracite shadow-lg transition hover:bg-white sm:left-5"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Afficher la bannière suivante"
              className="absolute right-3 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-anthracite shadow-lg transition hover:bg-white sm:right-5"
            >
              <ChevronRight size={22} />
            </button>
            <div
              className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2"
              aria-label="Sélectionner une bannière"
            >
              {slides.map((item, index) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setIdx(index)}
                  aria-label={`Afficher la bannière ${index + 1}`}
                  aria-current={index === idx ? "true" : undefined}
                  className={`h-2.5 rounded-full transition-all ${index === idx ? "w-7 bg-white" : "w-2.5 bg-white/55 hover:bg-white/80"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
