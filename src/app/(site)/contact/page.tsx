import { PageHeader, Wrap } from "@/components/public/ui";
import { getSettings } from "@/lib/queries";
import ContactForm from "./ContactForm";
export const metadata = { title: "Contact Us" };
export default async function Page() {
  const st = await getSettings();
  return (<><PageHeader pageKey="contact" title="Contact Us" sub="Reach the SRC office or send us a message." />
    <Wrap><div className="grid gap-8 md:grid-cols-[1fr_1.3fr]">
      <div className="space-y-4">
        {[["Address", [st.poBox, st.address].filter(Boolean).join(", ")], ["Phone", st.phone], ["Email", st.email], ["Office hours", st.hours]].filter(([, v]) => v).map(([k, v]) => (
          <div key={k as string} className="rounded-xl bg-white p-5 shadow-sm"><p className="text-xs font-semibold tracking-[.24em] text-emerald">{(k as string).toUpperCase()}</p><p className="mt-1 whitespace-pre-line">{v}</p></div>))}
        {st.mapUrl && <a href={st.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-block font-semibold text-emerald underline">Open in maps ↗</a>}
      </div>
      <ContactForm /></div></Wrap></>);
}
