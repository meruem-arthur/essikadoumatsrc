import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/queries";
import { saveSettings } from "@/features/admin/more-actions";
import ImageField from "@/features/admin/ImageField";

export const dynamic = "force-dynamic";
export default async function Page() {
  await requireAdmin("settings:write"); const st = await getSettings();
  const c = "w-full rounded-lg border border-black/15 px-3 py-2", L = "block space-y-1 text-sm font-medium";
  const text: [string, string, string | undefined][] = [
    ["site_name", "Site name", st.siteName], ["tagline", "Tagline", st.tagline], ["campus", "Campus name", st.campus], ["contact_email", "Contact email", st.email], ["phone", "Phone", st.phone],
    ["po_box", "P.O. Box", st.poBox], ["address", "Address", st.address], ["office_hours", "Office hours", st.hours], ["footer_text", "Footer text", st.footer],
    ["map_url", "Map link (Google Maps URL)", st.mapUrl], ["portal_url", "Student portal URL", st.portalUrl], ["sports_url", "SRC Sports site URL", st.sportsUrl]];
  return (<div className="space-y-4"><h1 className="display text-4xl">Settings</h1>
    <form action={saveSettings} className="max-w-2xl space-y-4 rounded-xl bg-white p-6 shadow-sm">
      {text.map(([k, l, v]) => <label key={k} className={L}>{l}<input name={k} defaultValue={v ?? ""} required={k === "site_name"} className={c} /></label>)}
      {(["facebook", "instagram", "x", "youtube", "tiktok", "whatsapp"] as const).map((k) => <label key={k} className={L}><span className="capitalize">{k} URL</span><input name={k} type="url" defaultValue={st.socials[k] ?? ""} className={c} /></label>)}
      <div className={L}>Logo<ImageField name="logo" folder="site" initial={st.logo ?? null} /></div>
      <div className={L}>Mobile menu background image<ImageField name="sidebar_image" folder="site" initial={st.sidebarImage ?? null} /></div>
      <button className="rounded-lg bg-emerald px-5 py-2.5 font-semibold text-white">Save settings</button></form></div>);
}
