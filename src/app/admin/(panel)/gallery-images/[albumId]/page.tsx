import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { galleryAlbums, galleryImages } from "@/db/schema";
import { deleteImage, captionImage } from "@/features/admin/more-actions";
import DeleteButton from "@/features/admin/DeleteButton";
import GalleryUploader from "@/features/admin/GalleryUploader";

export default async function Page({ params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params; await requireAdmin("gallery:write");
  if (!/^[0-9a-f-]{36}$/i.test(albumId)) notFound();
  const [a] = await db.select().from(galleryAlbums).where(eq(galleryAlbums.id, albumId)); if (!a) notFound();
  const imgs = await db.select().from(galleryImages).where(eq(galleryImages.albumId, albumId)).orderBy(asc(galleryImages.displayOrder));
  return (<div className="space-y-4"><h1 className="display text-4xl">{a.title} · Photos</h1><GalleryUploader albumId={albumId} />
    {imgs.length === 0 ? <p className="text-black/50">No photos yet.</p> : <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{imgs.map((i) => (
      <div key={i.id} className="space-y-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={i.url.replace("/upload/", "/upload/f_auto,q_auto,w_300,h_300,c_fill/")} alt="" className="aspect-square w-full rounded-lg object-cover" loading="lazy" />
        <form action={captionImage.bind(null, i.id)} className="flex gap-1"><input name="caption" defaultValue={i.caption ?? ""} placeholder="Caption" className="min-w-0 flex-1 rounded border border-black/15 px-2 py-1 text-xs" /><button className="text-xs text-emerald">Save</button></form>
        <DeleteButton action={deleteImage.bind(null, i.id)} /></div>))}</div>}</div>);
}
