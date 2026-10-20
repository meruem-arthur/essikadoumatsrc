import { PageHeader, PersonCard, Empty, Grid } from "@/components/public/ui";
import { executivesList } from "@/lib/queries";
export const metadata = { title: "Executives" };
export default async function Page() {
  const list = await executivesList();
  return (<><PageHeader pageKey="executives" title="Executives" sub="The leaders serving students this academic year." />
    {list.length ? <Grid cols="grid-cols-2 md:grid-cols-4">{list.map((m) => <PersonCard key={m.id} img={m.profileImage} name={m.fullName} role={m.position} sub={[m.programme, m.level].filter(Boolean).join(" · ")} href={`/executives/${m.slug}`} />)}</Grid>
      : <div className="mx-auto max-w-6xl px-4 py-12"><Empty>Executives will appear here once added in the admin dashboard.</Empty></div>}</>);
}
