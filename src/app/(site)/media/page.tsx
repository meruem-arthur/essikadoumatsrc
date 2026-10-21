import Link from "next/link";
import { PageHeader, Photo, Empty, Grid, Section } from "@/components/public/ui";
import VideoGrid from "@/components/public/VideoGrid";
import { albums, albumYears, publishedVideos } from "@/lib/queries";
export const metadata = { title: "Media" };
export default async function Page({ searchParams }: { searchParams: Promise<{ y?: string }> }) {
  const { y } = await searchParams; const year = Number(y) || undefined;
  const [list, years, videos] = await Promise.all([albums({ year }), albumYears(), publishedVideos()]);
  return (<><PageHeader pageKey="media" title="Media" sub="Photos from campus life, events and projects." />
    {years.length > 0 && <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 pt-10 text-sm font-semibold">
      <Link href="/media" className={`rounded-full border px-4 py-1.5 ${!year ? "border-emerald bg-emerald text-white" : "border-black/15"}`}>All</Link>
      {years.map((v) => <Link key={v} href={`/media?y=${v}`} className={`rounded-full border px-4 py-1.5 ${year === v ? "border-emerald bg-emerald text-white" : "border-black/15"}`}>{v}</Link>)}</div>}
    {list.length ? <Grid cols="grid-cols-2 md:grid-cols-4">{list.map((a) => (
      <Link key={a.id} href={`/media/${a.slug}`} className="group block"><Photo img={a.coverImage} alt={a.title} sizes="(min-width:768px) 25vw, 50vw" className="aspect-square rounded-2xl" /><p className="mt-2 text-sm font-bold group-hover:text-emerald">{a.title}</p>{a.year && <p className="text-xs text-black/50">{a.year}</p>}</Link>))}</Grid>
      : <div className="mx-auto max-w-6xl px-4 py-12"><Empty>Albums will appear here once added in the admin dashboard.</Empty></div>}
    {videos.length > 0 && !year && <Section title="Videos" dark><div className="text-chalk"><VideoGrid videos={videos} /></div></Section>}</>);
}
