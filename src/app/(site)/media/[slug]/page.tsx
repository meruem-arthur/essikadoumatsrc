import { notFound } from "next/navigation";
import Link from "next/link";
import { PreviewBanner, PageHeader, Wrap, Empty, Rich } from "@/components/public/ui";
import MasonryGallery from "@/components/public/MasonryGallery";
import { albumBySlug, albumImages, fmtDay } from "@/lib/queries";
import { meta, type SlugP, type SlugPreviewP } from "@/lib/seo";
import { getSession } from "@/lib/auth";

export async function generateMetadata({ params }: SlugP) { const a = await albumBySlug((await params).slug); return a ? meta(a.title, a.description, a.coverImage) : {}; }
export default async function Page({ params, searchParams }: SlugPreviewP) {
  const preview = (await searchParams).preview ? !!(await getSession()) : false;
  const a = await albumBySlug((await params).slug, preview); if (!a) notFound();
  const imgs = await albumImages(a.id);
  return (<><PageHeader title={a.title} sub={a.albumDate ? fmtDay(a.albumDate) : a.year ? String(a.year) : undefined} image={a.coverImage} />
    <Wrap>{a.description && <Rich text={a.description} className="max-w-3xl" />}
      {imgs.length ? <MasonryGallery items={imgs.map((i) => ({ src: i.url, alt: i.altText ?? a.title, caption: i.caption }))} /> : <Empty>No photos in this album yet.</Empty>}
      <Link href="/media" className="font-semibold text-emerald">← All albums</Link></Wrap>{preview && <PreviewBanner />}</>);
}
