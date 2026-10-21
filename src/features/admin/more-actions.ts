"use server";
import { and, asc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { cloudinaryPrefix } from "@/lib/cloudinary";
import { galleryImages, galleryAlbums, siteSettings, messages } from "@/db/schema";
import { audit } from "@/lib/audit";
import { destroyImage } from "@/lib/cloudinary";

const uuid = z.string().uuid();
const done = () => revalidatePath("/", "layout");

export async function addImages(albumId: string, imgs: { publicId: string; url: string; width?: number; height?: number }[]) {
  const me = await requireAdmin("gallery:write"); uuid.parse(albumId);
  const clean = z.array(z.object({ publicId: z.string(), url: z.string().startsWith(cloudinaryPrefix()), width: z.number().optional(), height: z.number().optional() })).max(100).parse(imgs);
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(galleryImages).where(eq(galleryImages.albumId, albumId));
  if (clean.length) {
    await db.insert(galleryImages).values(clean.map((i, k) => ({ albumId, ...i, displayOrder: n + k })));
    const [album] = await db.select().from(galleryAlbums).where(eq(galleryAlbums.id, albumId));
    if (album && !album.coverImage) await db.update(galleryAlbums).set({ coverImage: { publicId: clean[0].publicId, url: clean[0].url } }).where(eq(galleryAlbums.id, albumId));
    await audit(me, "uploaded", "gallery photos", `${clean.length} photo(s) to "${album?.title}"`, albumId);
  }
  done();
}
export async function deleteImage(id: string) {
  const me = await requireAdmin("gallery:write"); uuid.parse(id);
  const [img] = await db.select().from(galleryImages).where(eq(galleryImages.id, id)); if (!img) return;
  await db.delete(galleryImages).where(eq(galleryImages.id, id));
  // If it was the album cover, fall back to the next photo (or none).
  const [album] = await db.select().from(galleryAlbums).where(eq(galleryAlbums.id, img.albumId));
  if (album?.coverImage?.publicId === img.publicId) {
    const [next] = await db.select().from(galleryImages).where(eq(galleryImages.albumId, img.albumId)).orderBy(asc(galleryImages.displayOrder)).limit(1);
    await db.update(galleryAlbums).set({ coverImage: next ? { publicId: next.publicId, url: next.url } : null }).where(eq(galleryAlbums.id, img.albumId));
  }
  await destroyImage(img.publicId);
  await audit(me, "deleted", "gallery photo", img.caption ?? img.publicId, id);
  done();
}

/** Swap a photo with its neighbour (dir -1 = earlier, +1 = later). */
export async function moveImage(id: string, dir: -1 | 1) {
  await requireAdmin("gallery:write"); uuid.parse(id);
  const [img] = await db.select().from(galleryImages).where(eq(galleryImages.id, id)); if (!img) return;
  const all = await db.select().from(galleryImages).where(eq(galleryImages.albumId, img.albumId)).orderBy(asc(galleryImages.displayOrder), asc(galleryImages.createdAt));
  const i = all.findIndex((x) => x.id === id), j = i + dir;
  if (j < 0 || j >= all.length) return;
  const a = all[i], b = all[j];
  // Re-number just the two so ties can never make a move a no-op.
  const [oa, ob] = a.displayOrder === b.displayOrder ? [j, i] : [b.displayOrder, a.displayOrder];
  await db.update(galleryImages).set({ displayOrder: oa }).where(eq(galleryImages.id, a.id));
  await db.update(galleryImages).set({ displayOrder: ob }).where(eq(galleryImages.id, b.id));
  done();
}
export async function makeFirst(id: string) {
  await requireAdmin("gallery:write"); uuid.parse(id);
  const [img] = await db.select().from(galleryImages).where(eq(galleryImages.id, id)); if (!img) return;
  const [{ m }] = await db.select({ m: sql<number>`coalesce(min(display_order), 0)::int` }).from(galleryImages).where(eq(galleryImages.albumId, img.albumId));
  await db.update(galleryImages).set({ displayOrder: m - 1 }).where(eq(galleryImages.id, id));
  done();
}
export async function setCover(id: string) {
  const me = await requireAdmin("gallery:write"); uuid.parse(id);
  const [img] = await db.select().from(galleryImages).where(eq(galleryImages.id, id)); if (!img) return;
  const [album] = await db.select().from(galleryAlbums).where(eq(galleryAlbums.id, img.albumId));
  await db.update(galleryAlbums).set({ coverImage: { publicId: img.publicId, url: img.url } }).where(eq(galleryAlbums.id, img.albumId));
  if (album?.coverImage?.publicId && album.coverImage.publicId !== img.publicId) { /* old cover is still a gallery photo: keep the file */ }
  await audit(me, "set cover", "gallery", album?.title, img.albumId);
  done();
}
export async function captionImage(id: string, fd: FormData) {
  await requireAdmin("gallery:write");
  const caption = z.string().max(200).parse(fd.get("caption") ?? "");
  await db.update(galleryImages).set({ caption: caption || null }).where(eq(galleryImages.id, uuid.parse(id)));
  done();
}

const KEYS = ["site_name", "tagline", "campus", "contact_email", "phone", "po_box", "address", "office_hours", "footer_text", "sports_url", "portal_url", "map_url"] as const;
const SOCIALS = ["facebook", "instagram", "x", "youtube", "tiktok", "whatsapp"] as const;
export async function saveSettings(fd: FormData) {
  const me = await requireAdmin("settings:write");
  const before = await db.select().from(siteSettings).where(sql`${siteSettings.key} in ('logo','sidebar_image')`);
  const url = z.string().url().or(z.literal(""));
  const shape: Record<string, z.ZodTypeAny> = Object.fromEntries(KEYS.map((k) => [k, k === "site_name" ? z.string().min(1).max(80) : k.endsWith("_url") ? url : k === "contact_email" ? z.string().email().or(z.literal("")) : z.string().max(300)]));
  for (const k of SOCIALS) shape[k] = url;
  const p = z.object(shape).parse(Object.fromEntries([...KEYS, ...SOCIALS].map((k) => [k, fd.get(k) ?? ""]))) as Record<string, string>;
  const imageVal = (name: string) => {
    const raw = fd.get(name) as string; if (!raw) return null;
    const o = JSON.parse(raw); if (!String(o.url).startsWith(cloudinaryPrefix())) throw new Error("Bad image");
    return { publicId: String(o.publicId), url: String(o.url) };
  };
  const entries: Record<string, unknown> = Object.fromEntries(KEYS.map((k) => [k, p[k]]));
  entries.socials = Object.fromEntries(SOCIALS.map((k) => [k, p[k]]));
  entries.logo = imageVal("logo"); entries.sidebar_image = imageVal("sidebar_image");
  for (const [key, value] of Object.entries(entries))
    await db.insert(siteSettings).values({ key, value: value as any }).onConflictDoUpdate({ target: siteSettings.key, set: { value: value as any } });
  for (const b of before) { const old = (b.value as any)?.publicId, now = (entries[b.key] as any)?.publicId; if (old && old !== now) await destroyImage(old); }
  await audit(me, "updated", "settings", "Site settings");
  done();
}

export async function markMessage(id: string, read: boolean) { await requireAdmin("messages:write"); await db.update(messages).set({ isRead: read }).where(eq(messages.id, uuid.parse(id))); revalidatePath("/admin/messages"); }
export async function deleteMessage(id: string) { const me = await requireAdmin("messages:write"); await db.delete(messages).where(eq(messages.id, uuid.parse(id))); await audit(me, "deleted", "message", id); revalidatePath("/admin/messages"); }
