import { PageHeader, Card, Empty, Grid } from "@/components/public/ui";
import { publishedProjects } from "@/lib/queries";
export const metadata = { title: "SRC Projects" };
export default async function Page() {
  const list = await publishedProjects();
  return (<><PageHeader pageKey="projects" title="SRC Projects" sub="What the council is building for students." />
    {list.length ? <Grid>{list.map((p) => <Card key={p.id} href={`/projects/${p.slug}`} img={p.coverImage} title={p.title} meta={`${p.status}${p.year ? ` · ${p.year}` : ""}`} text={p.summary} />)}</Grid>
      : <div className="mx-auto max-w-6xl px-4 py-12"><Empty>No projects published yet.</Empty></div>}</>);
}
