"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export type LightboxImage = { src: string; alt?: string; caption?: string | null };
const MIN_ZOOM = 1, MAX_ZOOM = 4, STEP = 0.5;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
type Pt = { x: number; y: number };

/** Full-screen viewer: arrows/keys/swipe to navigate, pinch / wheel / double-tap / buttons to zoom, drag to pan. */
export default function Lightbox({ images, index, onClose, onChange, zoom = true }:
  { images: LightboxImage[]; index: number | null; onClose: () => void; onChange: (i: number) => void; zoom?: boolean }) {
  const open = index !== null && !!images[index];
  const total = images.length;
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState<Pt>({ x: 0, y: 0 });
  const pointers = useRef(new Map<number, Pt>());
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const pinch = useRef<{ d: number; s: number } | null>(null);
  const touchStart = useRef<Pt | null>(null);
  const lastTap = useRef(0);

  const resetZoom = useCallback(() => { setScale(1); setPos({ x: 0, y: 0 }); }, []);
  const go = useCallback((dir: number) => { if (total > 1 && index !== null) onChange((index + dir + total) % total); }, [index, total, onChange]);
  const changeZoom = useCallback((delta: number) => {
    setScale((s) => { const n = clamp(s + delta, MIN_ZOOM, MAX_ZOOM); if (n === 1) setPos({ x: 0, y: 0 }); return n; });
  }, []);

  useEffect(() => { resetZoom(); }, [index, resetZoom]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (zoom && (e.key === "+" || e.key === "=")) changeZoom(STEP);
      else if (zoom && (e.key === "-" || e.key === "_")) changeZoom(-STEP);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose, go, zoom, changeZoom]);

  if (!open || index === null) return null;
  const img = images[index];
  const dist = () => { const [a, b] = [...pointers.current.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };

  const down = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && zoom) { pinch.current = { d: dist(), s: scale }; drag.current = null; touchStart.current = null; }
    else if (pointers.current.size === 1) {
      if (zoom && scale > 1) drag.current = { x: e.clientX, y: e.clientY, ox: pos.x, oy: pos.y };
      else touchStart.current = { x: e.clientX, y: e.clientY };
    }
  };
  const move = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current && pointers.current.size === 2) {
      const n = clamp(pinch.current.s * (dist() / pinch.current.d), MIN_ZOOM, MAX_ZOOM);
      setScale(n); if (n === 1) setPos({ x: 0, y: 0 });
    } else if (drag.current) setPos({ x: drag.current.ox + (e.clientX - drag.current.x), y: drag.current.oy + (e.clientY - drag.current.y) });
  };
  const up = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) {
      drag.current = null;
      if (touchStart.current && scale === 1 && total > 1) {
        const dx = e.clientX - touchStart.current.x, dy = e.clientY - touchStart.current.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
      }
      touchStart.current = null;
      if (zoom) {
        const now = Date.now();
        if (now - lastTap.current < 300) { if (scale > 1) resetZoom(); else setScale(2); }
        lastTap.current = now;
      }
    }
  };

  const btn = "w-11 h-11 flex items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-colors";
  const ico = { fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/90" role="dialog" aria-modal="true" aria-label={img.alt || "Image viewer"}>
      <div className="flex shrink-0 items-center justify-between px-4 py-3 text-white">
        <span className="text-lg tabular-nums">{total > 1 ? `${index + 1} / ${total}` : ""}</span>
        <div className="flex items-center gap-1">
          {zoom && <>
            <button type="button" onClick={() => changeZoom(STEP)} disabled={scale >= MAX_ZOOM} aria-label="Zoom in" className={`${btn} disabled:opacity-40`}>
              <svg width="26" height="26" viewBox="0 0 24 24" strokeWidth="1.8" {...ico}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3M11 8v6M8 11h6" /></svg></button>
            <button type="button" onClick={() => changeZoom(-STEP)} disabled={scale <= MIN_ZOOM} aria-label="Zoom out" className={`${btn} disabled:opacity-40`}>
              <svg width="26" height="26" viewBox="0 0 24 24" strokeWidth="1.8" {...ico}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3M8 11h6" /></svg></button></>}
          <button type="button" onClick={onClose} aria-label="Close" className={btn}>
            <svg width="26" height="26" viewBox="0 0 24 24" strokeWidth="2.2" {...ico}><path d="M5 5l14 14M19 5L5 19" /></svg></button>
        </div>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        {total > 1 && <button type="button" onClick={() => go(-1)} aria-label="Previous image" className={`${btn} absolute left-2 z-10 bg-black/40 md:left-6`}>
          <svg width="28" height="28" viewBox="0 0 24 24" strokeWidth="2" {...ico}><path d="M15 5l-7 7 7 7" /></svg></button>}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={img.src} src={img.src} alt={img.alt || ""} draggable={false}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
          onWheel={(e) => { if (zoom) changeZoom(e.deltaY < 0 ? 0.25 : -0.25); }}
          className="max-h-full max-w-full select-none object-contain"
          style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`, transition: drag.current || pinch.current ? "none" : "transform .15s ease-out",
            cursor: zoom ? (scale > 1 ? "grab" : "zoom-in") : "default", touchAction: zoom || total > 1 ? "none" : "auto" }} />
        {total > 1 && <button type="button" onClick={() => go(1)} aria-label="Next image" className={`${btn} absolute right-2 z-10 bg-black/40 md:right-6`}>
          <svg width="28" height="28" viewBox="0 0 24 24" strokeWidth="2" {...ico}><path d="M9 5l7 7-7 7" /></svg></button>}
      </div>
      {img.caption && <p className="shrink-0 px-4 py-3 text-center text-sm text-white/80">{img.caption}</p>}
    </div>
  );
}
