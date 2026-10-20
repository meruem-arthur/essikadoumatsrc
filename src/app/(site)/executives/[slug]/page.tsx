import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader, Photo, Rich, Wrap } from "@/components/public/ui";
import { executiveBySlug } from "@/lib/queries";
import { meta, type SlugP } from "@/lib/seo";

export async function generateMetadata({ params }: SlugP) { const e = await executiveBySlug((await params).slug); return e ? meta(e.fullName, e.bio, e.profileImage) : {}; }
export default async function Page({ params }: SlugP) {
  const e = await executiveBySlug((await params).slug); if (!e) notFound();
  return (<><PageHeader title={e.fullName} sub={e.position} />
    <Wrap><div className="grid gap-8 md:grid-cols-[320px_1fr]">
      <Photo img={e.profileImage} alt={e.fullName} focus="portrait" sizes="320px" className="aspect-[4/5] rounded-2xl" />
      <div><p className="text-xs font-semibold tracking-[.24em] text-emerald">{e.position.toUpperCase()}</p>
        <p className="mt-1 text-black/60">{[e.programme, e.level].filter(Boolean).join(" · ")}</p>
        {e.bio ? <div className="mt-5"><Rich text={e.bio} /></div> : null}
        {e.email && <a href={`mailto:${e.email}`} className="mt-5 inline-block font-semibold text-emerald underline">{e.email}</a>}</div></div>
      <Link href="/executives" className="font-semibold text-emerald">← All executives</Link></Wrap></>);
}
