"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import NetworkBar, { type NetworkItem } from "./NetworkBar";

export type NavItem = { label: string; href: string; children?: { label: string; href: string }[] };

export default function SiteHeader({ name, logo, nav, sidebarImage, sportsUrl, network = [] }:
  { name: string; logo: string; nav: NavItem[]; sidebarImage?: string; sportsUrl?: string; network?: NetworkItem[] }) {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const path = usePathname();
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    const f = () => setSolid(window.scrollY > 24);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header className="fixed inset-x-0 top-0 z-40 text-chalk">
      <div className={`pointer-events-none absolute inset-0 scrim-top transition-opacity duration-300 ${solid ? "opacity-0" : "opacity-100"}`} aria-hidden />
      <div className={`relative border-b transition-all duration-300 ${solid ? "border-white/10 bg-forest/95 backdrop-blur-md" : "border-transparent bg-transparent"}`}>
        {!solid && network.length > 0 && <NetworkBar items={network} current="src" />}
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Image src="/umat-logo.jpg" alt="UMaT" width={36} height={44} className="h-9 w-auto shrink-0 rounded bg-white p-0.5" priority />
            <Image src={logo} alt="SRC" width={40} height={40} className="h-10 w-10 shrink-0 rounded-full bg-white" priority />
            <span className="hidden min-w-0 flex-col leading-none min-[460px]:flex">
              <span className="display text-glow truncate text-xl md:text-2xl">{name}</span>
              <span className="text-glow mt-1 text-[10px] tracking-[.26em] opacity-80">ESSIKADO CAMPUS</span></span>
          </Link>
          <nav className="hidden items-center gap-5 text-[13.5px] font-semibold xl:flex">
            {nav.map((n) => n.children ? (
              <div key={n.label} className="group relative">
                <button type="button" className="text-glow link-underline flex items-center gap-1 py-2 hover:text-goldlight">{n.label}<span className="text-[9px]">▾</span></button>
                <div className="invisible absolute left-0 top-full min-w-52 rounded-md bg-forest p-2 opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  {n.children.map((c) => <Link key={c.href} href={c.href} className="block rounded px-3 py-2 hover:bg-white/10 hover:text-goldlight">{c.label}</Link>)}</div>
              </div>
            ) : <Link key={n.href} href={n.href} className="text-glow link-underline hover:text-goldlight">{n.label}</Link>)}
            {sportsUrl && <a href={sportsUrl} target="_blank" rel="noopener noreferrer" className="rounded-sm bg-gold px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink hover:bg-goldlight">SRC Sports ↗</a>}
          </nav>
          <div className="flex items-center gap-1">
          <Link href="/search" aria-label="Search the site" className="flex h-9 w-9 items-center justify-center rounded-full hover:text-goldlight">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg></Link>
          <button type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] xl:hidden">
            <span className="block h-px w-6 bg-current" /><span className="block h-px w-6 bg-current" /></button>
          </div>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-80 max-w-[88vw] overflow-y-auto border-l border-white/10 bg-forest">
            {sidebarImage && <Image src={sidebarImage} alt="" fill sizes="320px" className="object-cover opacity-20" />}
            <div className="relative flex min-h-full flex-col p-7">
              <div className="mb-8 flex items-center justify-between">
                <Image src={logo} alt="SRC" width={48} height={48} className="rounded-full bg-white" />
                <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 hover:border-gold">✕</button>
              </div>
              <nav className="flex flex-col">
                {nav.map((n) => (
                  <div key={n.label}>
                    {n.children ? (<>
                      <p className="border-b border-white/10 py-3 text-xs tracking-[.24em] text-goldlight">{n.label.toUpperCase()}</p>
                      {n.children.map((c) => <Link key={c.href} href={c.href} className="block border-b border-white/10 py-3 pl-3 text-lg font-semibold hover:text-goldlight">{c.label}</Link>)}
                    </>) : <Link href={n.href} className="block border-b border-white/10 py-3 text-lg font-semibold hover:text-goldlight">{n.label}</Link>}
                  </div>))}
              </nav>
              {sportsUrl && <a href={sportsUrl} target="_blank" rel="noopener noreferrer" className="mt-6 rounded-sm bg-gold px-4 py-3 text-center text-sm font-bold uppercase tracking-wide text-ink">SRC Sports ↗</a>}
            </div>
          </aside>
        </div>)}
    </header>
  );
}
