"use server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { galleryImages } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { cloudinaryPrefix, destroyImage } from "@/lib/cloudinary";
import { youtubeId } from "@/lib/youtube";
import { RESOURCES, type Resource } from "./resources";

const slugify = (x: string) => x.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
const imageIds = (r: Resource, row: any) => r.fields.filter((f) => f.type === "image").map((f) => [f.name, row?.[f.name]?.publicId as string | undefined] as const);

export async function save(key: string, id: string, _prev: { error?: string } | undefined, fd: FormData) {
  const r = RESOURCES[key];
  if (!r) return { error: "Unknown resource" };
  const me = await requireAdmin(r.perm); // server-side authorization on every write
  const v: Record<string, any> = {};
  for (const f of r.fields) {
    const raw = fd.get(f.name) as string | null;
    if (f.type === "bool") { v[f.name] = raw === "on"; continue; }
    if (!raw) { if (f.required) return { error: `${f.label} is required` }; if (f.type !== "number") v[f.name] = null; continue; }
    const bad = { error: `Invalid ${f.label}` };
    if (f.type === "number") { const n = Number(raw); if (!Number.isFinite(n)) return bad; v[f.name] = n; }
    else if (f.type === "datetime") { const d = new Date(raw); if (isNaN(+d)) return bad; v[f.name] = d; }
    else if (f.type === "select") { if (!f.options!.includes(raw)) return bad; v[f.name] = raw; }
    else if (f.type === "ref") { if (!z.string().uuid().safeParse(raw).success) return bad; v[f.name] = raw; }
    else if (f.type === "image") {
      try {
        const o = JSON.parse(raw);
        if (!String(o.url).startsWith(cloudinaryPrefix())) throw 0;
        v[f.name] = { publicId: String(o.publicId), url: String(o.url) };
      } catch { return bad; }
    } else v[f.name] = raw.trim().slice(0, 20000);
  }
  if (key === "videos") { const yt = youtubeId(String(v.url ?? "")); if (!yt) return { error: "Enter a valid YouTube link" }; v.youtubeId = yt; }
  if (r.slugFrom && id === "new") v.slug = `${slugify(v[r.slugFrom])}-${Math.random().toString(36).slice(2, 6)}`;
  if (v.status === "published" && "publishedAt" in r.table && !v.publishedAt) v.publishedAt = new Date();
  let savedId = id; let old: any;
  try {
    if (id === "new") { const [row] = await db.insert(r.table).values(v).returning({ id: r.table.id }); savedId = row.id; }
    else {
      z.string().uuid().parse(id);
      [old] = await db.select().from(r.table).where(eq(r.table.id, id));
      await db.update(r.table).set(v).where(eq(r.table.id, id));
    }
  } catch { return { error: "Could not save. Check for duplicates (e.g. a page that already exists) or missing links." }; }
  // A replaced or removed image is no longer referenced anywhere: delete it from Cloudinary.
  if (old) for (const [name, pid] of imageIds(r, old)) if (pid && pid !== v[name]?.publicId) await destroyImage(pid);
  await audit(me, id === "new" ? "created" : "updated", key, v[r.titleCol] ?? old?.[r.titleCol], savedId);
  revalidatePath("/", "layout");
  redirect(`/admin/${key}?saved=1`);
}

export async function remove(key: string, id: string) {
  const r = RESOURCES[key];
  if (!r) return;
  const me = await requireAdmin(r.perm);
  z.string().uuid().parse(id);
  const [row] = await db.select().from(r.table).where(eq(r.table.id, id));
  if (!row) return;
  // Gather every Cloudinary file this record owns before the rows disappear.
  const ids = imageIds(r, row).map(([, p]) => p);
  if (key === "gallery") ids.push(...(await db.select({ p: galleryImages.publicId }).from(galleryImages).where(eq(galleryImages.albumId, id))).map((x) => x.p));
  await db.delete(r.table).where(eq(r.table.id, id));
  for (const p of ids) await destroyImage(p);
  await audit(me, "deleted", key, row[r.titleCol], id);
  revalidatePath("/", "layout");
  redirect(`/admin/${key}?deleted=1`);
}
