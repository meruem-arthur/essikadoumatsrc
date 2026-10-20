import Link from "next/link";
import Image from "next/image";
import SiteHeader, { type NavItem } from "@/components/public/SiteHeader";
import { getSettings, quickLinks } from "@/lib/queries";

export const revalidate = 60;

const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about", children: [
    { label: "About SRC", href: "/about" }, { label: "Judicial Committee", href: "/judicial-committee" },
    { label: "Local NUGS", href: "/local-nugs" }, { label: "SRC Constitution", href: "/constitution" }] },
  { label: "Executives", href: "/executives" },
  { label: "Committees", href: "/committees" },
  { label: "News", href: "/news" },
  { label: "Projects", href: "/projects" },
  { label: "Events", href: "/events" },
  { label: "Media", href: "/media" },
  { label: "Academics", href: "/academics" },
  { label: "Contact", href: "/contact" },
];
const DEFAULT_LINKS = [
  { id: "d1", label: "SRC Projects", url: "/projects", groupName: "Quick Links" },
  { id: "d2", label: "Local NUGS", url: "/local-nugs", groupName: "Quick Links" },
  { id: "d3", label: "SRC Constitution", url: "/constitution", groupName: "Quick Links" },
  { id: "d4", label: "Freshers' Guide", url: "/freshers-guide", groupName: "Quick Links" },
  { id: "d5", label: "Resources & Downloads", url: "/resources", groupName: "Quick Links" },
];

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [st, links] = await Promise.all([getSettings(), quickLinks()]);
  const logo = st.logo?.url ?? "/src-logo.png";
  const all = links.length ? links : DEFAULT_LINKS;
  const groups = [...new Set(all.map((l) => l.groupName))];
  const isExternal = (u: string) => /^https?:\/\//.test(u);
  return (<>
    <SiteHeader name={st.siteName} logo={logo} nav={NAV} sidebarImage={st.sidebarImage?.url} sportsUrl={st.sportsUrl} />
    <main>{children}</main>
    <footer className="bg-forest py-14 text-chalk">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="mb-4 flex items-center gap-3">
            <Image src="/umat-logo.jpg" alt="UMaT" width={48} height={58} className="h-12 w-auto rounded bg-white p-1" />
            <Image src={logo} alt="SRC" width={56} height={56} className="h-14 w-14 rounded-full bg-white" /></div>
          <p className="display text-3xl">{st.siteName}</p>
          <p className="mt-2 text-sm opacity-70">{st.footer ?? "Students' Representative Council · University of Mines and Technology"}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {Object.entries(st.socials).filter(([, u]) => u).map(([k, u]) => <a key={k} href={u as string} target="_blank" rel="noopener noreferrer" className="capitalize opacity-80 hover:text-goldlight hover:opacity-100">{k}</a>)}</div>
        </div>
        <div><p className="mb-3 text-xs tracking-[.28em] text-goldlight">UMAT SRC</p>
          <ul className="space-y-1.5 text-sm opacity-80">{[["About SRC", "/about"], ["Executives", "/executives"], ["Committees", "/committees"], ["News", "/news"], ["Events", "/events"], ["Media", "/media"]].map(([l, h]) => <li key={h}><Link href={h} className="hover:text-goldlight">{l}</Link></li>)}</ul></div>
        {groups.map((g) => (
          <div key={g}><p className="mb-3 text-xs tracking-[.28em] text-goldlight">{g.toUpperCase()}</p>
            <ul className="space-y-1.5 text-sm opacity-80">{all.filter((l) => l.groupName === g).map((l) => (
              <li key={l.id}>{isExternal(l.url) ? <a href={l.url} target="_blank" rel="noopener noreferrer" className="hover:text-goldlight">{l.label} ↗</a> : <Link href={l.url} className="hover:text-goldlight">{l.label}</Link>}</li>))}
              {g === groups[0] && st.portalUrl && <li><a href={st.portalUrl} target="_blank" rel="noopener noreferrer" className="hover:text-goldlight">Student Portal ↗</a></li>}
              {g === groups[0] && st.sportsUrl && <li><a href={st.sportsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-goldlight">SRC Sports ↗</a></li>}</ul></div>))}
        <div><p className="mb-3 text-xs tracking-[.28em] text-goldlight">GET IN TOUCH</p>
          <ul className="space-y-1.5 text-sm opacity-80">
            {st.poBox && <li>{st.poBox}</li>}{st.address && <li>{st.address}</li>}
            {st.phone && <li><a href={`tel:${st.phone.replace(/\s/g, "")}`} className="hover:text-goldlight">Tel: {st.phone}</a></li>}
            {st.email && <li><a href={`mailto:${st.email}`} className="hover:text-goldlight">{st.email}</a></li>}</ul></div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl border-t border-white/10 px-4 pt-6 text-xs opacity-50">© {new Date().getFullYear()} {st.siteName}. All rights reserved.</p>
    </footer>
  </>);
}
