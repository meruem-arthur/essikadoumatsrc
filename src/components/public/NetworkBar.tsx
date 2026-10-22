export type NetworkItem = { key: string; label: string; href: string };

/** Thin strip linking the sister sites. The current site is highlighted and not a link. */
export default function NetworkBar({ items, current }: { items: NetworkItem[]; current: string }) {
  return (
    <div className="bg-black/40 text-[11px] tracking-[.18em] text-white/70">
      <nav aria-label="UMaT SRC sites" className="mx-auto flex max-w-6xl items-center gap-4 overflow-x-auto whitespace-nowrap px-4 py-1.5">
        <span className="hidden shrink-0 text-white/40 sm:inline">UMaT SRID SRC</span>
        {items.map((n) => n.key === current
          ? <span key={n.key} aria-current="page" className="shrink-0 font-bold text-goldlight">{n.label.toUpperCase()}</span>
          : <a key={n.key} href={n.href} className="shrink-0 hover:text-goldlight">{n.label.toUpperCase()} ↗</a>)}
      </nav>
    </div>
  );
}
