"use client";
import { useCallback, useState } from "react";
import type { Img } from "@/db/schema";
import { Photo } from "./photo";
import Lightbox from "./Lightbox";

/** A photo that opens full-screen (zoomable lightbox) when clicked or activated with the keyboard. Not for banners/heroes. */
export default function ZoomPhoto({ img, alt = "", sizes, className = "", focus = "soft" }:
  { img?: Img | null; alt?: string; sizes?: string; className?: string; focus?: "center" | "portrait" | "soft" }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  if (!img) return <Photo img={img} alt={alt} sizes={sizes} className={className} focus={focus} zoom={false} />;
  return (
    <>
      <div role="button" tabIndex={0} aria-label={`View larger${alt ? `: ${alt}` : ""}`} className="cursor-zoom-in"
        onClick={() => setOpen(true)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true); } }}>
        <Photo img={img} alt={alt} sizes={sizes} className={className} focus={focus} zoom={false} />
      </div>
      <Lightbox images={[{ src: img.url, alt: img.alt ?? alt }]} index={open ? 0 : null} onClose={close} onChange={() => {}} />
    </>
  );
}
