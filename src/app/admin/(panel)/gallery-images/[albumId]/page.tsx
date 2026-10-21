import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { galleryAlbums, galleryImages } from "@/db/schema";
import { deleteImage, captionImage, moveImage, makeFirst, setCover } from "@/features/admin/more-actions";
import DeleteButton from "@/features/admin/DeleteButton";
import GalleryUploader from "@/features/admin/GalleryUploader";

export default async function Page({ params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params; await requireAdmin("gallery:write");
  if (!/^[0-9a-f-]{36}$/i.test(albumId)) notFound();
  const [a] = await db.select().from(galleryAlbums).where(eq(galleryAlbums.id, albumId)); if (!a) notFound();
  const imgs = await db.select().from(galleryImages).where(eq(galleryImages.albumId, albumId)).orderBy(asc(galleryImages.displayOrder), asc(galleryImages.createdAt));
  const btn = "rounded border border-black/15 px-2 py-0.5 text-xs hover:border-emerald hover:text-emerald";
  return (<div className="space-y-4"><h1 className="display text-4xl">{a.title} · Photos</h1><GalleryUploader albumId={albumId} />
    <p className="text-sm text-black/60">Photos show on the site in this order. Use ← → to reorder, “Make first” to move one to the front, and “Set cover” to choose the album thumbnail.</p>
    {imgs.length === 0 ? <p className="text-black/50">No photos yet.</p> : <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">{imgs.map((i, k) => {
      const isCover = a.coverImage?.publicId === i.publicId;
      return (<div key={i.id} className={`space-y-1 rounded-lg p-1 ${isCover ? "ring-2 ring-gold" : ""}`}>
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={i.url.replace("/upload/", "/upload/f_auto,q_auto,w_300,h_300,c_fill/")} alt="" className="aspect-square w-full rounded-lg object-cover" loading="lazy" />
          <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 text-xs text-white">{k + 1}</span>
          {isCover && <span className="absolute right-1 top-1 rounded bg-gold px-1.5 text-xs font-bold text-ink">COVER</span>}</div>
        <div className="flex flex-wrap gap-1">
          <form action={moveImage.bind(null, i.id, -1)}><button className={btn} disabled={k === 0} aria-label="Move earlier">←</button></form>
          <form action={moveImage.bind(null, i.id, 1)}><button className={btn} disabled={k === imgs.length - 1} aria-label="Move later">→</button></form>
          {k > 0 && <form action={makeFirst.bind(null, i.id)}><button className={btn}>Make first</button></form>}
          {!isCover && <form action={setCover.bind(null, i.id)}><button className={btn}>Set cover</button></form>}</div>
        <form action={captionImage.bind(null, i.id)} className="flex gap-1"><input name="caption" defaultValue={i.caption ?? ""} placeholder="Caption" className="min-w-0 flex-1 rounded border border-black/15 px-2 py-1 text-xs" /><button className="text-xs text-emerald">Save</button></form>
        <DeleteButton action={deleteImage.bind(null, i.id)} /></div>);
    })}</div>}</div>);
}
