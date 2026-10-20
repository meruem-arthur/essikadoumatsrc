import ContentPage from "@/components/public/ContentPage";
import { PersonCard } from "@/components/public/ui";
import { membersOfKind } from "@/lib/queries";
export const metadata = { title: "Local NUGS" };
export default async function Page() {
  const rows = await membersOfKind("nugs");
  return (<ContentPage pageKey="local-nugs" title="Local NUGS" sub="UMaT's chapter of the National Union of Ghana Students.">
    {rows.length > 0 && <div><h2 className="display mb-5 text-3xl">Local NUGS leadership</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{rows.map(({ m }) => <PersonCard key={m.id} img={m.profileImage} name={m.fullName} role={m.role} />)}</div></div>}
  </ContentPage>);
}
