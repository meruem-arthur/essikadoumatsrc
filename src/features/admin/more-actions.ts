"use server";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { cloudinaryPrefix } from "@/lib/cloudinary";
import { galleryImages, siteSettings, messages } from "@/db/schema";

const uuid = z.string().uuid();
const done = () => revalidatePath("/", "layout");

export async function addImages(albumId: string, imgs: { publicId: string; url: string; width?: number; height?: number }[]) {
  await requireAdmin("gallery:write"); uuid.parse(albumId);
  const clean = z.array(z.object({ publicId: z.string(), url: z.string().startsWith(cloudinaryPrefix()), width: z.number().optional(), height: z.number().optional() })).max(100).parse(imgs);
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(galleryImages).where(eq(galleryImages.albumId, albumId));
  if (clean.length) await db.insert(galleryImages).values(clean.map((i, k) => ({ albumId, ...i, displayOrder: n + k })));
  done();
}
export async function deleteImage(id: string) { await requireAdmin("gallery:write"); await db.delete(galleryImages).where(eq(galleryImages.id, uuid.parse(id))); done(); }
export async function captionImage(id: string, fd: FormData) {
  await requireAdmin("gallery:write");
  const caption = z.string().max(200).parse(fd.get("caption") ?? "");
  await db.update(galleryImages).set({ caption: caption || null }).where(eq(galleryImages.id, uuid.parse(id)));
  done();
}

const KEYS = ["site_name", "tagline", "campus", "contact_email", "phone", "po_box", "address", "office_hours", "footer_text", "sports_url", "portal_url", "map_url"] as const;
const SOCIALS = ["facebook", "instagram", "x", "youtube", "tiktok", "whatsapp"] as const;
export async function saveSettings(fd: FormData) {
  await requireAdmin("settings:write");
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
  done();
}

export async function markMessage(id: string, read: boolean) { await requireAdmin("messages:write"); await db.update(messages).set({ isRead: read }).where(eq(messages.id, uuid.parse(id))); revalidatePath("/admin/messages"); }
export async function deleteMessage(id: string) { await requireAdmin("messages:write"); await db.delete(messages).where(eq(messages.id, uuid.parse(id))); revalidatePath("/admin/messages"); }
