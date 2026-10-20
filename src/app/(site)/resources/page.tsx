import { PageHeader, Empty, Wrap } from "@/components/public/ui";
import { activeDocuments } from "@/lib/queries";
export const metadata = { title: "Resources & Downloads" };
export default async function Page() {
  const docs = await activeDocuments();
  const cats = [...new Set(docs.map((d) => d.category ?? "General"))];
  return (<><PageHeader pageKey="resources" title="Resources" sub="Forms, documents and useful links." />
    <Wrap narrow>{docs.length ? cats.map((c) => (<div key={c}><h2 className="display mb-3 text-3xl">{c}</h2>
      <ul className="divide-y divide-black/10 rounded-xl bg-white shadow-sm">{docs.filter((d) => (d.category ?? "General") === c).map((d) => <li key={d.id}>
        <a href={d.url} target="_blank" rel="noopener noreferrer" className="block p-4 hover:bg-black/5"><p className="font-semibold">{d.title} ↗</p>{d.description && <p className="text-sm text-black/60">{d.description}</p>}</a></li>)}</ul></div>))
      : <Empty>No documents yet.</Empty>}</Wrap></>);
}
