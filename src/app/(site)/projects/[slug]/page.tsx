import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader, Photo, Rich, Wrap } from "@/components/public/ui";
import { projectBySlug } from "@/lib/queries";
import { meta, type SlugP } from "@/lib/seo";

export async function generateMetadata({ params }: SlugP) { const p = await projectBySlug((await params).slug); return p ? meta(p.title, p.summary, p.coverImage) : {}; }
export default async function Page({ params }: SlugP) {
  const p = await projectBySlug((await params).slug); if (!p) notFound();
  return (<><PageHeader title={p.title} sub={`${p.status.toUpperCase()}${p.year ? ` · ${p.year}` : ""}`} image={p.coverImage} />
    <Wrap narrow>
      {p.coverImage && <Photo img={p.coverImage} alt={p.title} sizes="(min-width:768px) 768px, 100vw" className="aspect-[16/9] rounded-2xl" zoom={false} />}
      {p.summary && <p className="text-xl font-medium">{p.summary}</p>}{p.content && <Rich text={p.content} />}
      <Link href="/projects" className="font-semibold text-emerald">← All projects</Link></Wrap></>);
}
