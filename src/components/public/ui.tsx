import Link from "next/link";
import { pageHero } from "@/lib/queries";
import { Photo } from "./photo";
import type { Img } from "@/db/schema";
export { Photo };

export function Section({ n, title, href, hrefLabel = "See all →", children, dark }:
  { n?: string; title: string; href?: string; hrefLabel?: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <section className={`${dark ? "bg-forest text-chalk" : ""} py-14 md:py-20`}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>{n && <p className="mb-1 flex items-center gap-3 text-xs font-semibold tracking-[.28em] text-emerald"><span className="h-px w-6 bg-gold" /><span className={dark ? "text-goldlight" : ""}>{n}</span></p>}
            <h2 className="display text-4xl md:text-6xl">{title}</h2></div>
          {href && <Link href={href} className="shrink-0 text-sm font-semibold underline-offset-4 hover:underline">{hrefLabel}</Link>}
        </div>{children}
      </div>
    </section>
  );
}

/** Page banner. The photo (managed in Admin → Page Heroes, keyed by `pageKey`) stays clear; copy sits on the translucent hero panel. */
export async function PageHeader({ pageKey, title, sub, image }: { pageKey?: string; title: string; sub?: string | null; image?: Img | null }) {
  const h = pageKey ? await pageHero(pageKey) : undefined;
  const img = h?.image ?? image;
  return (
    <header className={`relative flex items-end overflow-hidden bg-forest pb-12 pt-32 text-chalk ${img ? "min-h-[56svh]" : "min-h-[300px]"}`}>
      {img && <><Photo img={img} priority sizes="100vw" className="absolute inset-0" /><div className="scrim-top absolute inset-0" /></>}
      <div className="relative mx-auto w-full max-w-6xl px-4">
        <div className="hero-panel inline-block max-w-2xl px-6 py-6 md:px-9 md:py-8">
          <h1 className="display text-glow break-words text-4xl sm:text-5xl md:text-7xl">{h?.title ?? title}</h1>
          {(h?.subtitle ?? sub) && <p className="mt-3 max-w-xl text-lg opacity-95">{h?.subtitle ?? sub}</p>}
        </div>
      </div>
    </header>
  );
}

export const Empty = ({ children }: { children: React.ReactNode }) => <p className="rounded-xl border border-dashed border-black/20 p-8 text-center text-black/50">{children}</p>;
export const Wrap = ({ children, narrow }: { children: React.ReactNode; narrow?: boolean }) => <div className={`mx-auto ${narrow ? "max-w-3xl" : "max-w-6xl"} space-y-10 px-4 py-12`}>{children}</div>;
export const Grid = ({ children, cols = "md:grid-cols-3" }: { children: React.ReactNode; cols?: string }) => <div className={`mx-auto grid max-w-6xl gap-6 px-4 py-12 ${cols}`}>{children}</div>;

export function Card({ href, img, title, meta, text }: { href: string; img?: Img | null; title: string; meta?: string; text?: string | null }) {
  return (
    <Link href={href} className="group block">
      <Photo img={img} alt={title} className="aspect-[16/10] rounded-2xl" />
      {meta && <p className="mt-3 text-xs uppercase tracking-wider text-black/50">{meta}</p>}
      <h3 className="mt-1 text-lg font-bold group-hover:text-emerald">{title}</h3>
      {text && <p className="line-clamp-2 text-sm text-black/60">{text}</p>}
    </Link>
  );
}

/** Person card used for executives, pillars, committee members. */
export function PersonCard({ img, name, role, sub, href }: { img?: Img | null; name: string; role?: string | null; sub?: string | null; href?: string }) {
  const body = (<>
    <Photo img={img} alt={name} focus="portrait" sizes="(min-width:768px) 25vw, 50vw" className="aspect-[4/5] rounded-2xl" />
    <p className="mt-3 font-bold group-hover:text-emerald">{name}</p>
    {role && <p className="text-sm font-semibold text-emerald">{role}</p>}
    {sub && <p className="text-sm text-black/60">{sub}</p>}
  </>);
  return href ? <Link href={href} className="group block">{body}</Link> : <div className="group">{body}</div>;
}

/** Tiny safe renderer for admin-written text: blank line = paragraph, "## " heading, "### " subheading, "- " bullets. */
export function Rich({ text, className = "" }: { text: string; className?: string }) {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className={`space-y-5 text-lg leading-relaxed ${className}`}>
      {blocks.map((b, i) => {
        if (b.startsWith("## ")) return <h2 key={i} className="display pt-4 text-3xl md:text-4xl">{b.slice(3)}</h2>;
        if (b.startsWith("### ")) return <h3 key={i} className="pt-2 text-xl font-bold">{b.slice(4)}</h3>;
        const lines = b.split("\n");
        if (lines.every((l) => /^[-•] /.test(l))) return <ul key={i} className="list-disc space-y-1 pl-6">{lines.map((l, k) => <li key={k}>{l.slice(2)}</li>)}</ul>;
        return <p key={i} className="whitespace-pre-line">{b}</p>;
      })}
    </div>
  );
}

export const LinkButton = ({ href, children, ghost }: { href: string; children: React.ReactNode; ghost?: boolean }) => (
  <Link href={href} className={ghost ? "inline-block rounded-sm border border-current px-6 py-3 text-sm font-bold uppercase tracking-wide hover:text-gold" : "inline-block rounded-sm bg-gold px-6 py-3 text-sm font-bold uppercase tracking-wide text-ink hover:bg-goldlight"}>{children}</Link>
);
