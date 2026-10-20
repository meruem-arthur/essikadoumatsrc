import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader, Photo, Rich, Wrap } from "@/components/public/ui";
import { announcementBySlug, fmtDay } from "@/lib/queries";
import { meta, type SlugP } from "@/lib/seo";

export async function generateMetadata({ params }: SlugP) { const a = await announcementBySlug((await params).slug); return a ? meta(a.title, a.description, a.flyer) : {}; }
export default async function Page({ params }: SlugP) {
  const a = await announcementBySlug((await params).slug); if (!a) notFound();
  return (<><PageHeader title={a.title} sub={`NOTICE · ${fmtDay(a.publishedAt)}`} />
    <Wrap narrow>
      {a.flyer && <Photo img={a.flyer} alt={a.title} sizes="(min-width:768px) 768px, 100vw" className="aspect-[4/5] rounded-2xl" zoom={false} />}
      <Rich text={a.description} /><Link href="/news" className="font-semibold text-emerald">← News</Link></Wrap></>);
}
