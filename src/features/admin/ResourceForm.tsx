"use client";
import { useActionState } from "react";
import ImageField from "./ImageField";
import { save } from "./actions";

export type FormField = { name: string; label: string; type: string; required?: boolean; help?: string; options?: { value: string; label: string }[]; folder?: string; value: any };
const cls = "w-full rounded-lg border border-black/15 bg-white px-3 py-2";

export default function ResourceForm({ resource, id, fields }: { resource: string; id: string; fields: FormField[] }) {
  const [state, action, pending] = useActionState(save.bind(null, resource, id), undefined);
  return (
    <form action={action} className="max-w-2xl space-y-5 rounded-xl bg-white p-6 shadow-sm">
      {fields.map((f) => (
        <label key={f.name} className="block space-y-1 text-sm font-medium">
          {f.type !== "bool" && <span>{f.label}{f.required && " *"}</span>}
          {f.type === "textarea" ? <textarea name={f.name} defaultValue={f.value ?? ""} rows={8} className={cls} />
          : f.type === "bool" ? <span className="flex items-center gap-2"><input type="checkbox" name={f.name} defaultChecked={!!f.value} />{f.label}</span>
          : f.type === "image" ? <ImageField name={f.name} folder={f.folder!} initial={f.value ?? null} />
          : f.options ? <select name={f.name} defaultValue={f.value ?? ""} className={cls}><option value="">{f.required ? "Select…" : "None"}</option>
              {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
          : <input name={f.name} defaultValue={f.value ?? ""} type={f.type === "datetime" ? "datetime-local" : f.type === "date" ? "date" : f.type === "number" ? "number" : "text"} className={cls} />}
          {f.help && <span className="block text-xs font-normal text-black/50">{f.help}</span>}
        </label>))}
      {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      <button disabled={pending} className="rounded-lg bg-emerald px-5 py-2.5 font-semibold text-white disabled:opacity-60">{pending ? "Saving…" : "Save"}</button>
    </form>
  );
}
