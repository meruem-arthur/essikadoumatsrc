import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader, PersonCard, Rich, Wrap } from "@/components/public/ui";
import { committeeBySlug, membersOf } from "@/lib/queries";
import { meta, type SlugP } from "@/lib/seo";

export async function generateMetadata({ params }: SlugP) { const c = await committeeBySlug((await params).slug); return c ? meta(c.name, c.description, c.coverImage) : {}; }
export default async function Page({ params }: SlugP) {
  const c = await committeeBySlug((await params).slug); if (!c) notFound();
  const members = await membersOf(c.id);
  return (<><PageHeader title={c.name} image={c.coverImage} />
    <Wrap>{c.description && <Rich text={c.description} className="max-w-3xl" />}
      {members.length > 0 && <div><h2 className="display mb-5 text-3xl">Members</h2><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{members.map((m) => <PersonCard key={m.id} img={m.profileImage} name={m.fullName} role={m.role} />)}</div></div>}
      <Link href="/committees" className="font-semibold text-emerald">← All committees</Link></Wrap></>);
}
