import Link from "next/link";
import * as q from "@/lib/queries";
import HeroSlider from "@/components/public/HeroSlider";
import MasonryGallery from "@/components/public/MasonryGallery";
import { Photo, Section, Card, PersonCard, Empty, LinkButton } from "@/components/public/ui";

export default async function Home() {
  const [st, slides, ev, ann, news, events, stats, pillars, execs, photos, fresh] = await Promise.all([
    q.getSettings(), q.heroSlides(), q.upcomingEvents(3), q.latestAnnouncement(), q.publishedNews(3), q.upcomingEvents(3),
    q.activeStats(), q.activePillars(), q.executivesList(4), q.recentPhotos(12), q.pageByKey("freshers-guide")]);
  const president = (await q.executivesList(1))[0];
  const next = ev[0];
  return (<>
    {slides.length ? <HeroSlider slides={slides as any} eyebrow={`Students' Representative Council · ${st.campus}`} /> : (
      <section className="bg-forest py-32 text-chalk"><div className="mx-auto max-w-6xl px-4">
        <h1 className="display text-5xl md:text-8xl">{st.siteName}</h1>
        <p className="mt-4 max-w-xl opacity-80">{st.tagline ?? "Hero slides are managed from the admin dashboard."}</p></div></section>)}

    {(next || ann) && <div className="bg-gold"><div className="mx-auto flex max-w-6xl flex-wrap gap-x-8 gap-y-1 px-4 py-3 text-sm font-semibold text-ink">
      {next && <Link href={`/events/${next.slug}`}>NEXT EVENT: {next.title} · {q.fmt(next.startsAt)}</Link>}
      {ann && <Link href={`/announcements/${ann.slug}`}>NOTICE: {ann.title}</Link>}</div></div>}

    <Section n="01 / EXPLORE" title="Explore UMaT SRC">
      <div className="grid gap-6 md:grid-cols-3">
        {[["About SRC", "Who we are, what we stand for and how the council serves students at Essikado.", "/about"],
          ["SRC Projects", "Initiatives delivered for students: from campus safety to student welfare.", "/projects"],
          ["Media", "Photos from campus life, events and projects across the year.", "/media"]].map(([t, d, h]) => (
          <Link key={h} href={h} className="group rounded-2xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <h3 className="display text-3xl group-hover:text-emerald">{t}</h3><p className="mt-2 text-black/60">{d}</p><p className="mt-4 text-sm font-bold text-emerald">Open →</p></Link>))}
      </div>
    </Section>

    {stats.length > 0 && <div className="bg-emerald text-chalk"><div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4">
      {stats.map((s) => <div key={s.id} className="text-center"><p className="display text-5xl text-goldlight md:text-6xl">{s.value}</p><p className="mt-1 text-sm tracking-wide opacity-90">{s.label}</p></div>)}</div></div>}

    {(president || pillars.length > 0) && <Section n="02 / LEADERSHIP" title="Our leaders" href="/executives" hrefLabel="All executives →">
      <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
        {president && <div className="grid gap-5 sm:grid-cols-[200px_1fr] md:grid-cols-1 lg:grid-cols-[220px_1fr]">
          <Photo img={president.profileImage} alt={president.fullName} focus="portrait" sizes="220px" className="aspect-[4/5] rounded-2xl" />
          <div><p className="text-xs font-semibold tracking-[.24em] text-emerald">{president.position.toUpperCase()}</p><h3 className="display mt-1 text-3xl">{president.fullName}</h3>
            {president.bio && <p className="mt-3 line-clamp-6 text-black/70">{president.bio}</p>}
            <Link href={`/executives/${president.slug}`} className="mt-3 inline-block text-sm font-bold text-emerald">Read more →</Link></div></div>}
        {pillars.length > 0 && <div><p className="mb-4 text-xs font-semibold tracking-[.24em] text-emerald">INSTITUTIONAL PILLARS</p>
          <div className="grid grid-cols-2 gap-4">{pillars.map((p) => <PersonCard key={p.id} img={p.profileImage} name={p.fullName} role={p.title} />)}</div></div>}
      </div>
    </Section>}

    <Section n="03 / NEWS" title="Latest news" href="/news" dark>
      {news.length ? <div className="grid gap-6 text-chalk md:grid-cols-3">{news.map((n) => (
        <Link key={n.id} href={`/news/${n.slug}`} className="group block"><Photo img={n.coverImage} alt={n.title} className="aspect-[16/10] rounded-2xl" />
          <p className="mt-3 text-xs uppercase tracking-wider text-goldlight">{n.category} · {q.fmtDay(n.publishedAt)}</p>
          <h3 className="mt-1 text-lg font-bold group-hover:text-goldlight">{n.title}</h3><p className="line-clamp-2 text-sm opacity-70">{n.excerpt}</p></Link>))}</div> : <p className="opacity-60">No news published yet.</p>}
    </Section>

    <Section n="04 / EVENTS" title="Upcoming events" href="/events">
      {events.length ? <div className="grid gap-6 md:grid-cols-3">{events.map((e) => <Card key={e.id} href={`/events/${e.slug}`} img={e.coverImage} title={e.title} meta={`${q.fmt(e.startsAt)}${e.venue ? ` · ${e.venue}` : ""}`} text={e.description} />)}</div> : <Empty>There are no upcoming events at this time.</Empty>}
    </Section>

    {fresh && <section className="bg-gold py-14"><div className="mx-auto flex max-w-6xl flex-col items-start gap-5 px-4 md:flex-row md:items-center md:justify-between">
      <div><p className="text-xs font-semibold tracking-[.28em]">FRESHERS</p><h2 className="display text-4xl md:text-5xl">{fresh.title}</h2>{fresh.subtitle && <p className="mt-2 max-w-xl">{fresh.subtitle}</p>}</div>
      <Link href="/freshers-guide" className="rounded-sm bg-forest px-6 py-3 text-sm font-bold uppercase tracking-wide text-chalk">Read the guide →</Link></div></section>}

    {st.portalUrl && <section className="bg-forest py-16 text-chalk"><div className="mx-auto max-w-6xl px-4">
      <p className="text-xs font-semibold tracking-[.28em] text-goldlight">STUDENTS' PORTAL</p>
      <h2 className="display mt-1 max-w-3xl text-4xl md:text-6xl">Your gateway to endless opportunities</h2>
      <p className="mt-4 max-w-2xl opacity-80">Internship placements, scholarships, student forums and campus services, all in one place.</p>
      <div className="mt-6 flex flex-wrap gap-3"><a href={st.portalUrl} target="_blank" rel="noopener noreferrer" className="rounded-sm bg-gold px-6 py-3 text-sm font-bold uppercase tracking-wide text-ink">Access portal ↗</a><LinkButton href="/contact" ghost>Get support</LinkButton></div></div></section>}

    {execs.length > 0 && <Section n="05 / THE COUNCIL" title="Meet the executives" href="/executives">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{execs.map((m) => <PersonCard key={m.id} img={m.profileImage} name={m.fullName} role={m.position} sub={[m.programme, m.level].filter(Boolean).join(" · ")} href={`/executives/${m.slug}`} />)}</div></Section>}

    {photos.length > 0 && <Section n="06 / LIFE & CULTURE" title="In pictures" href="/media">
      <MasonryGallery columns="columns-2 md:columns-4" items={photos.map((p) => ({ src: p.img.url, alt: p.img.altText ?? p.album, caption: p.img.caption }))} /></Section>}
  </>);
}
