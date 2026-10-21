"use client";
import { useState } from "react";
import Image from "next/image";

export type VideoItem = { id: string; title: string; youtubeId: string; description: string | null };

/** Click-to-play facade: no YouTube scripts or cookies load until a visitor actually presses play. */
function VideoCard({ v }: { v: VideoItem }) {
  const [play, setPlay] = useState(false);
  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-forest">
        {play ? (
          <iframe src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}?autoplay=1&rel=0`} title={v.title} className="absolute inset-0 h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
        ) : (
          <button type="button" onClick={() => setPlay(true)} aria-label={`Play video: ${v.title}`} className="group absolute inset-0">
            <Image src={`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
            <span className="absolute inset-0 bg-black/25 transition group-hover:bg-black/10" />
            <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold text-2xl text-ink shadow-lg">▶</span>
          </button>)}
      </div>
      <h3 className="mt-3 font-bold">{v.title}</h3>
      {v.description && <p className="line-clamp-2 text-sm text-black/60">{v.description}</p>}
    </div>
  );
}
export default function VideoGrid({ videos }: { videos: VideoItem[] }) {
  return <div className="grid gap-6 md:grid-cols-3">{videos.map((v) => <VideoCard key={v.id} v={v} />)}</div>;
}
