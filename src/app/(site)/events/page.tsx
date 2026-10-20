import { PageHeader, Card, Empty, Section } from "@/components/public/ui";
import { upcomingEvents, pastEvents, fmt } from "@/lib/queries";
export const metadata = { title: "Events" };
export default async function Page() {
  const [up, past] = await Promise.all([upcomingEvents(), pastEvents(24)]);
  return (<><PageHeader pageKey="events" title="Events" sub="What's happening on campus." />
    <Section title="Upcoming">{up.length ? <div className="grid gap-6 md:grid-cols-3">{up.map((e) => <Card key={e.id} href={`/events/${e.slug}`} img={e.coverImage} title={e.title} meta={`${fmt(e.startsAt)}${e.venue ? ` · ${e.venue}` : ""}`} text={e.description} />)}</div> : <Empty>There are no upcoming events at this time.</Empty>}</Section>
    {past.length > 0 && <Section title="Past events" dark><div className="grid gap-6 text-chalk md:grid-cols-3">{past.map((e) => <Card key={e.id} href={`/events/${e.slug}`} img={e.coverImage} title={e.title} meta={fmt(e.startsAt)} />)}</div></Section>}</>);
}
