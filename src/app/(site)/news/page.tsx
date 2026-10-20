import Link from "next/link";
import { PageHeader, Card, Empty, Grid } from "@/components/public/ui";
import { publishedNews, fmtDay } from "@/lib/queries";
export const metadata = { title: "News" };
const CATS = ["news", "announcement", "press"];
export default async function Page({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const cat = CATS.includes(c ?? "") ? c : undefined;
  const list = await publishedNews(60, cat);
  return (<><PageHeader pageKey="news" title="News" sub="Updates, announcements and stories from the council." />
    <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 pt-10 text-sm font-semibold">
      {[["All", undefined], ["News", "news"], ["Announcements", "announcement"], ["Press", "press"]].map(([l, v]) => (
        <Link key={l} href={v ? `/news?c=${v}` : "/news"} className={`rounded-full border px-4 py-1.5 ${cat === v ? "border-emerald bg-emerald text-white" : "border-black/15 hover:border-emerald"}`}>{l}</Link>))}</div>
    {list.length ? <Grid>{list.map((n) => <Card key={n.id} href={`/news/${n.slug}`} img={n.coverImage} title={n.title} meta={`${n.category} · ${fmtDay(n.publishedAt)}`} text={n.excerpt} />)}</Grid>
      : <div className="mx-auto max-w-6xl px-4 py-12"><Empty>No news published yet.</Empty></div>}</>);
}
