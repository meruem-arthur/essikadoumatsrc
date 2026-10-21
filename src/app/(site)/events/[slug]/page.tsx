import { notFound } from "next/navigation";
import Link from "next/link";
import { PreviewBanner, PageHeader, Photo, Rich, Wrap } from "@/components/public/ui";
import { eventBySlug, fmt } from "@/lib/queries";
import { meta, type SlugP, type SlugPreviewP } from "@/lib/seo";
import { getSession } from "@/lib/auth";

export async function generateMetadata({ params }: SlugP) { const e = await eventBySlug((await params).slug); return e ? meta(e.title, e.description, e.coverImage) : {}; }
export default async function Page({ params, searchParams }: SlugPreviewP) {
  const preview = (await searchParams).preview ? !!(await getSession()) : false;
  const e = await eventBySlug((await params).slug, preview); if (!e) notFound();
  return (<><PageHeader title={e.title} sub={`${fmt(e.startsAt)}${e.venue ? ` · ${e.venue}` : ""}`} image={e.coverImage} />
    <Wrap narrow>
      {e.coverImage && <Photo img={e.coverImage} alt={e.title} sizes="(min-width:768px) 768px, 100vw" className="aspect-[16/9] rounded-2xl" zoom={false} />}
      {e.description && <Rich text={e.description} />}
      <Link href="/events" className="font-semibold text-emerald">← All events</Link></Wrap>{preview && <PreviewBanner />}</>);
}
