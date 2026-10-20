import { PageHeader, Card, Empty, Grid } from "@/components/public/ui";
import { committeesByKind } from "@/lib/queries";
export const metadata = { title: "Committees" };
export default async function Page() {
  const list = await committeesByKind("committee");
  return (<><PageHeader pageKey="committees" title="Committees" sub="The working groups that deliver the council's agenda." />
    {list.length ? <Grid>{list.map((c) => <Card key={c.id} href={`/committees/${c.slug}`} img={c.coverImage} title={c.name} text={c.description} />)}</Grid>
      : <div className="mx-auto max-w-6xl px-4 py-12"><Empty>Committees will appear here once added in the admin dashboard.</Empty></div>}</>);
}
