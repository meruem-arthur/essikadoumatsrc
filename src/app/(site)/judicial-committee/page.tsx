import ContentPage from "@/components/public/ContentPage";
import { PersonCard } from "@/components/public/ui";
import { membersOfKind } from "@/lib/queries";
export const metadata = { title: "Judicial Committee" };
export default async function Page() {
  const rows = await membersOfKind("judicial");
  return (<ContentPage pageKey="judicial-committee" title="Judicial Committee" sub="Upholding the SRC constitution and settling disputes fairly.">
    {rows.length > 0 && <div><h2 className="display mb-5 text-3xl">Members</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{rows.map(({ m }) => <PersonCard key={m.id} img={m.profileImage} name={m.fullName} role={m.role} />)}</div></div>}
  </ContentPage>);
}
