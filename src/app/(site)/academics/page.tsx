import ContentPage from "@/components/public/ContentPage";
import { activeDocuments } from "@/lib/queries";
export const metadata = { title: "Academics" };
export default async function Page() {
  const docs = (await activeDocuments()).filter((d) => d.category?.toLowerCase() === "academics");
  return (<ContentPage pageKey="academics" title="Academics" sub="Library, registration and academic support for students.">
    {docs.length > 0 && <div><h2 className="display mb-4 text-3xl">Academic resources</h2>
      <ul className="divide-y divide-black/10 rounded-xl bg-white shadow-sm">{docs.map((d) => <li key={d.id}><a href={d.url} target="_blank" rel="noopener noreferrer" className="block p-4 hover:bg-black/5"><p className="font-semibold">{d.title} ↗</p>{d.description && <p className="text-sm text-black/60">{d.description}</p>}</a></li>)}</ul></div>}
  </ContentPage>);
}
