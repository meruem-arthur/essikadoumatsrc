import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { RESOURCES } from "@/features/admin/resources";
import ResourceForm from "@/features/admin/ResourceForm";

export default async function EditPage({ params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  const r = RESOURCES[resource]; if (!r) notFound();
  await requireAdmin(r.perm);
  let row: any = {};
  if (id !== "new") {
    if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
    [row] = await db.select().from(r.table).where(eq(r.table.id, id)); if (!row) notFound();
  }
  const fields = await Promise.all(r.fields.map(async (f) => {
    let value = row[f.name];
    if (value instanceof Date) value = value.toISOString().slice(0, 16);
    let options = f.options?.map((o) => ({ value: o, label: o }));
    if (f.type === "ref") options = (await db.select({ id: f.ref!.table.id, l: f.ref!.table[f.ref!.label] }).from(f.ref!.table)).map((o: any) => ({ value: o.id, label: o.l }));
    return { name: f.name, label: f.label, type: f.type, required: f.required, help: f.help, folder: f.folder, options,
      value: value ?? (f.type === "bool" ? f.name === "isActive" : undefined) };
  }));
  return (<div className="space-y-4"><h1 className="display text-4xl">{id === "new" ? "New" : "Edit"} · {r.label}</h1><ResourceForm resource={resource} id={id} fields={fields} /></div>);
}
