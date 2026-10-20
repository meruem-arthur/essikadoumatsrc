"use client";
import { useCallback, useState } from "react";
import Image from "next/image";
import Lightbox from "./Lightbox";

export type GalleryItem = { src: string; alt?: string; caption?: string | null };

/** GESA-style editorial masonry: CSS columns with a repeating 3:4 / 1:1 / 4:3 rhythm, tap to open the zoomable lightbox. */
export default function MasonryGallery({ items, columns = "columns-2 md:columns-3" }: { items: GalleryItem[]; columns?: string }) {
  const [active, setActive] = useState<number | null>(null);
  const close = useCallback(() => setActive(null), []);
  return (
    <>
      <div className={`${columns} gap-3 [column-fill:_balance]`}>
        {items.map((p, i) => (
          <button type="button" key={`${p.src}-${i}`} onClick={() => setActive(i)} aria-label={`View photo ${i + 1} of ${items.length}`}
            className="group relative mb-3 block w-full cursor-zoom-in overflow-hidden bg-forest/10 break-inside-avoid"
            style={{ aspectRatio: i % 5 === 0 ? "3 / 4" : i % 3 === 0 ? "1 / 1" : "4 / 3" }}>
            <Image src={p.src} alt={p.alt || p.caption || "Gallery photo"} fill sizes="(min-width:768px) 33vw, 50vw" className="object-cover object-portrait-soft transition-transform duration-500 group-hover:scale-[1.04]" />
            {p.caption && <div className="absolute inset-0 flex items-end bg-gradient-to-t from-forest/80 via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
              <p className="text-xs tracking-wide text-white">{p.caption}</p></div>}
          </button>))}
      </div>
      <Lightbox images={items} index={active} onChange={setActive} onClose={close} />
    </>
  );
}
