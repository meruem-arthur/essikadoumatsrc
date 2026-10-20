import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader, Photo, Rich, Wrap, Card } from "@/components/public/ui";
import { newsBySlug, relatedNews, fmtDay } from "@/lib/queries";
import { meta, type SlugP } from "@/lib/seo";

export async function generateMetadata({ params }: SlugP) { const n = await newsBySlug((await params).slug); return n ? meta(n.title, n.excerpt, n.coverImage) : {}; }
export default async function Page({ params }: SlugP) {
  const n = await newsBySlug((await params).slug); if (!n) notFound();
  const more = await relatedNews(n.id);
  return (<><PageHeader title={n.title} sub={`${n.category.toUpperCase()} · ${fmtDay(n.publishedAt)}${n.author ? ` · ${n.author}` : ""}`} image={n.coverImage} />
    <Wrap narrow>
      {n.coverImage && <Photo img={n.coverImage} alt={n.title} sizes="(min-width:768px) 768px, 100vw" className="aspect-[16/9] rounded-2xl" zoom={false} />}
      <Rich text={n.content} />
      <Link href="/news" className="font-semibold text-emerald">← All news</Link></Wrap>
    {more.length > 0 && <div className="bg-white py-12"><div className="mx-auto max-w-6xl px-4"><h2 className="display mb-6 text-3xl">More news</h2>
      <div className="grid gap-6 md:grid-cols-3">{more.map((m) => <Card key={m.id} href={`/news/${m.slug}`} img={m.coverImage} title={m.title} meta={fmtDay(m.publishedAt)} />)}</div></div></div>}</>);
}
