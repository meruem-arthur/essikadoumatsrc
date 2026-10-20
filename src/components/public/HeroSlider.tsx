"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Img } from "@/db/schema";

export type Slide = { id: string; heading: string; description: string | null; image: Img; ctaLabel: string | null; ctaHref: string | null; secondaryCtaLabel: string | null; secondaryCtaHref: string | null };

/** Crossfading hero (GESA approach): photo stays clear, text sits on a translucent panel, light scrims keep the nav legible. */
export default function HeroSlider({ slides, eyebrow }: { slides: Slide[]; eyebrow: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);
  const s = slides[i];
  return (
    <section className="relative h-[84svh] max-h-[780px] min-h-[520px] overflow-hidden bg-forest text-chalk">
      <div className="absolute inset-0">
        {slides.map((sl, k) => (
          <Image key={sl.id} src={sl.image.url} alt={sl.image.alt ?? sl.heading} fill priority={k === 0} sizes="100vw"
            className="object-cover object-portrait-soft transition-opacity duration-[1400ms]" style={{ opacity: k === i ? 1 : 0 }} />))}
        <div className="scrim-bottom absolute inset-0" /><div className="scrim-top absolute inset-0" />
      </div>
      <div className="relative flex h-full flex-col justify-end">
        <div className="mx-auto w-full max-w-6xl px-4 pb-14 md:pb-20">
          <div className="hero-panel inline-block max-w-3xl px-6 py-7 md:px-9 md:py-9">
            <p className="mb-4 flex items-center gap-3 text-xs font-semibold tracking-[.24em] text-goldlight"><span className="h-px w-6 bg-gold" />{eyebrow.toUpperCase()}</p>
            <h1 className="display text-glow break-words text-4xl sm:text-5xl md:text-7xl">{s.heading}</h1>
            {s.description && <p className="mt-4 max-w-xl text-lg leading-relaxed opacity-95">{s.description}</p>}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {s.ctaLabel && s.ctaHref && <Link href={s.ctaHref} className="rounded-sm bg-gold px-6 py-3 text-sm font-bold uppercase tracking-wide text-ink hover:bg-goldlight">{s.ctaLabel} ↗</Link>}
            {s.secondaryCtaLabel && s.secondaryCtaHref && <Link href={s.secondaryCtaHref} className="rounded-sm border border-white/40 px-6 py-3 text-sm font-bold uppercase tracking-wide hover:border-gold hover:text-goldlight">{s.secondaryCtaLabel} →</Link>}
          </div>
        </div>
        {slides.length > 1 && <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 pb-6">
          {slides.map((sl, k) => <button key={sl.id} type="button" aria-label={`Slide ${k + 1}`} onClick={() => setI(k)} className="h-[3px] transition-all duration-300"
            style={{ width: k === i ? 28 : 12, background: k === i ? "var(--color-gold)" : "rgba(246,245,239,.35)" }} />)}
        </div>}
      </div>
    </section>
  );
}
