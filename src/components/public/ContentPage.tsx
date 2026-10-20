import Link from "next/link";
import { pageByKey } from "@/lib/queries";
import { PageHeader, Photo, Rich, Wrap, Empty } from "./ui";

/** Renders an admin-editable long-form page (Admin → Pages) under a page banner. */
export default async function ContentPage({ pageKey, title, sub, children }: { pageKey: string; title: string; sub?: string; children?: React.ReactNode }) {
  const p = await pageByKey(pageKey);
  return (<>
    <PageHeader pageKey={pageKey} title={p?.title ?? title} sub={p?.subtitle ?? sub} />
    <Wrap narrow={!children}>
      {p ? (<div className={p.image ? "grid gap-8 md:grid-cols-[1.4fr_1fr]" : ""}>
        <div><Rich text={p.body} />
          {p.ctaLabel && p.ctaHref && (/^https?:/.test(p.ctaHref)
            ? <a href={p.ctaHref} target="_blank" rel="noopener noreferrer" className="mt-8 inline-block rounded-sm bg-gold px-6 py-3 text-sm font-bold uppercase tracking-wide text-ink hover:bg-goldlight">{p.ctaLabel} ↗</a>
            : <Link href={p.ctaHref} className="mt-8 inline-block rounded-sm bg-gold px-6 py-3 text-sm font-bold uppercase tracking-wide text-ink hover:bg-goldlight">{p.ctaLabel} →</Link>)}</div>
        {p.image && <Photo img={p.image} alt={p.title} sizes="(min-width:768px) 40vw, 100vw" className="aspect-[4/5] rounded-2xl" />}
      </div>) : <Empty>This page's content is managed from the admin dashboard (Pages → {pageKey}).</Empty>}
      {children}
    </Wrap>
  </>);
}
