"use server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { cloudinaryPrefix } from "@/lib/cloudinary";
import { RESOURCES } from "./resources";

const slugify = (x: string) => x.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

export async function save(key: string, id: string, _prev: { error?: string } | undefined, fd: FormData) {
  const r = RESOURCES[key];
  if (!r) return { error: "Unknown resource" };
  await requireAdmin(r.perm); // server-side authorization on every write
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
  if (r.slugFrom && id === "new") v.slug = `${slugify(v[r.slugFrom])}-${Math.random().toString(36).slice(2, 6)}`;
  if (v.status === "published" && "publishedAt" in r.table && !v.publishedAt) v.publishedAt = new Date();
  try {
    if (id === "new") await db.insert(r.table).values(v);
    else { z.string().uuid().parse(id); await db.update(r.table).set(v).where(eq(r.table.id, id)); }
  } catch { return { error: "Could not save. Check for duplicates (e.g. a page that already exists) or missing links." }; }
  revalidatePath("/", "layout");
  redirect(`/admin/${key}?saved=1`);
}

export async function remove(key: string, id: string) {
  const r = RESOURCES[key];
  if (!r) return;
  await requireAdmin(r.perm);
  await db.delete(r.table).where(eq(r.table.id, z.string().uuid().parse(id)));
  revalidatePath("/", "layout");
  redirect(`/admin/${key}?deleted=1`);
}
