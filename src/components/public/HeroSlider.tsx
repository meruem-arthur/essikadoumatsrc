"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Img } from "@/db/schema";

export type Slide = { id: string; heading: string; description: string | null; image: Img; ctaLabel: string | null; ctaHref: string | null; secondaryCtaLabel: string | null; secondaryCtaHref: string | null };

const AUTOPLAY_MS = 6000;

/**
 * Full-width slideshow. Copy is centred over the photo (same layout as the main-campus site):
 * heading, description, then buttons. A soft even shade keeps the text readable while the photo stays visible.
 * Arrows, dots, swipe, and a pause/play button. Autoplay keeps going until a visitor presses pause. The outgoing photo stays opaque under the incoming one, so nothing shows through mid-fade.
 */
export default function HeroSlider({ slides, eyebrow }: { slides: Slide[]; eyebrow: string }) {
  const [st, setSt] = useState<{ i: number; prev: number | null }>({ i: 0, prev: null });
  const [playing, setPlaying] = useState(true);
  const startX = useRef<number | null>(null);
  const n = slides.length;
  const i = st.i;

  const go = useCallback((dir: number) => setSt((x) => ({ i: (x.i + dir + n) % n, prev: x.i })), [n]);
  const goTo = useCallback((k: number) => setSt((x) => (k === x.i ? x : { i: k, prev: x.i })), []);

  // Once the fade has finished, the old slide can be hidden for good.
  useEffect(() => {
    if (st.prev === null) return;
    const t = setTimeout(() => setSt((x) => ({ ...x, prev: null })), 1500);
    return () => clearTimeout(t);
  }, [st]);
  // Autoplay. The timer restarts after every change (manual or automatic) so a click never causes a double-jump.
  useEffect(() => {
    if (n < 2 || !playing) return;
    const t = setInterval(() => go(1), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [n, playing, go, st.i]);

  const s = slides[i];
  const arrow = "absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 text-2xl text-white backdrop-blur-sm transition hover:border-gold hover:bg-black/50 hover:text-goldlight sm:flex";

  return (
    <section
      aria-roledescription="carousel" aria-label="Featured"
      className="relative h-[88svh] max-h-[820px] min-h-[560px] overflow-hidden bg-black text-chalk"
      onPointerDown={(e) => { startX.current = e.clientX; }}
      onPointerUp={(e) => {
        if (startX.current !== null && n > 1) { const dx = e.clientX - startX.current; if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1); }
        startX.current = null;
      }}
    >
      <div className="absolute inset-0" aria-hidden>
        {slides.map((sl, k) => (
          <Image key={sl.id} src={sl.image.url} alt="" fill priority={k === 0} sizes="100vw"
            className="object-cover object-portrait-soft transition-opacity duration-[1400ms]"
            style={{ opacity: k === i || k === st.prev ? 1 : 0, zIndex: k === i ? 2 : k === st.prev ? 1 : 0 }} />))}
        {/* light, neutral shade for text legibility (no colour cast) */}
        <div className="absolute inset-0 z-[3] bg-black/20" />
        <div className="scrim-top absolute inset-0 z-[3]" />
        <div className="scrim-bottom absolute inset-0 z-[3]" />
      </div>

      {/* pt clears the fixed header (network bar + nav); content is centred in the space that's left */}
      <div className="relative flex h-full flex-col items-center justify-center px-4 pb-16 pt-32 text-center sm:pb-20 sm:pt-36">
        <div key={s.id} className="hero-fade mx-auto flex max-w-4xl flex-col items-center">
          <p className="mb-4 flex items-center gap-3 text-[11px] font-semibold tracking-[.24em] text-goldlight sm:text-xs">
            <span className="h-px w-6 bg-gold" />{eyebrow.toUpperCase()}<span className="h-px w-6 bg-gold" /></p>
          <h1 className="display text-glow break-words text-5xl sm:text-6xl md:text-7xl">{s.heading}</h1>
          {s.description && <p className="text-glow mt-5 max-w-3xl text-base leading-relaxed sm:text-lg md:text-xl">{s.description}</p>}
          {(s.ctaLabel && s.ctaHref) || (s.secondaryCtaLabel && s.secondaryCtaHref) ? (
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {s.ctaLabel && s.ctaHref && <Link href={s.ctaHref} className="rounded-sm bg-gold px-6 py-3 text-sm font-bold uppercase tracking-wide text-ink hover:bg-goldlight">{s.ctaLabel} ↗</Link>}
              {s.secondaryCtaLabel && s.secondaryCtaHref && <Link href={s.secondaryCtaHref} className="rounded-sm border border-white/50 bg-black/20 px-6 py-3 text-sm font-bold uppercase tracking-wide hover:border-gold hover:text-goldlight">{s.secondaryCtaLabel} →</Link>}
            </div>) : null}
        </div>
      </div>

      {n > 1 && <>
        <button type="button" onClick={() => go(-1)} aria-label="Previous slide" className={`${arrow} left-4 lg:left-8`}>‹</button>
        <button type="button" onClick={() => go(1)} aria-label="Next slide" className={`${arrow} right-4 lg:right-8`}>›</button>
        <div className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center gap-2">
          {slides.map((sl, k) => (
            <button key={sl.id} type="button" aria-label={`Go to slide ${k + 1}`} aria-current={k === i} onClick={() => goTo(k)}
              className="h-[3px] transition-all duration-300" style={{ width: k === i ? 32 : 14, background: k === i ? "var(--color-gold)" : "rgba(246,245,239,.45)" }} />))}
          <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause slideshow" : "Play slideshow"}
            className="ml-3 grid h-7 w-7 place-items-center rounded-full border border-white/40 text-[10px] text-white hover:border-gold hover:text-goldlight">{playing ? "❚❚" : "▶"}</button>
        </div>
      </>}
    </section>
  );
}
