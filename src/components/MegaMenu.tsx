"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, ChevronDown, Menu, Search, X } from "lucide-react";
import { NAV, type NavLink } from "@/config/navigation";

function NavAnchor({ link, onNavigate }: { link: NavLink; onNavigate?: () => void }) {
  const inner = (
    <>
      <span className="flex items-center gap-1 text-sm font-medium text-ink">
        {link.label}
        {link.external && <ArrowUpRight aria-hidden className="size-3.5 text-muted" />}
      </span>
      {link.desc && <span className="mt-0.5 block text-[0.8125rem] leading-snug text-muted">{link.desc}</span>}
    </>
  );
  const cls = "block rounded-md px-2 py-1.5 -mx-2 hover:bg-tint";
  return link.external ? (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls} onClick={onNavigate}>
      {inner}
      <span className="sr-only"> (membuka tab baru)</span>
    </a>
  ) : (
    <Link href={link.href} className={cls} onClick={onNavigate}>{inner}</Link>
  );
}

export default function MegaMenu() {
  const [open, setOpen] = useState<number | null>(null);
  const [mobile, setMobile] = useState(false);
  const [mobileSection, setMobileSection] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Esc menutup panel & mengembalikan fokus; klik di luar menutup panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (open !== null) { triggers.current[open]?.focus(); setOpen(null); }
      setMobile(false);
    };
    const onClick = (e: MouseEvent) => { if (!navRef.current?.contains(e.target as Node)) setOpen(null); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, [open]);

  useEffect(() => { document.body.style.overflow = mobile ? "hidden" : ""; }, [mobile]);

  const enter = (i: number) => { if (closeTimer.current) clearTimeout(closeTimer.current); setOpen(i); };
  const leave = () => { closeTimer.current = setTimeout(() => setOpen(null), 120); };

  return (
    <nav ref={navRef} aria-label="Navigasi utama" className="relative">
      <div className="container-x flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Beranda Desa Ungasan">
          <span aria-hidden className="grid size-8 place-items-center rounded-md bg-ink text-[13px] font-bold text-white">U</span>
          <span className="leading-tight">
            <span className="block text-[15px] font-semibold tracking-tight">Desa Ungasan</span>
            <span className="block text-[11px] text-muted">Kuta Selatan · Badung</span>
          </span>
        </Link>

        {/* Desktop */}
        <ul className="hidden items-center gap-1 lg:flex" onMouseLeave={leave}>
          {NAV.map((item, i) => (
            <li key={item.label} onMouseEnter={() => enter(i)}>
              <button
                ref={(el) => { triggers.current[i] = el; }}
                type="button"
                aria-expanded={open === i}
                aria-controls={`mega-${i}`}
                onClick={() => setOpen(open === i ? null : i)}
                className={`flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium transition-colors ${open === i ? "bg-tint text-ink" : "text-ink-2 hover:bg-tint"}`}
              >
                {item.label}
                <ChevronDown aria-hidden className={`size-3.5 text-muted transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link href="/berita" className="hidden size-9 place-items-center rounded-md hover:bg-tint sm:grid" aria-label="Cari berita dan informasi">
            <Search aria-hidden className="size-4" />
          </Link>
          <Link href="/hubungi-kami" className="btn-primary btn-sm hidden sm:inline-flex">Hubungi Kami</Link>
          <button type="button" className="grid size-9 place-items-center rounded-md hover:bg-tint lg:hidden"
            aria-label="Buka menu" aria-expanded={mobile} aria-controls="mobile-nav" onClick={() => setMobile(true)}>
            <Menu aria-hidden className="size-5" />
          </button>
        </div>
      </div>

      {/* Panel mega-menu */}
      {NAV.map((item, i) => (
        <div key={item.label} id={`mega-${i}`} hidden={open !== i}
          onMouseEnter={() => enter(i)} onMouseLeave={leave}
          className="absolute inset-x-0 top-full z-40 hidden border-y border-line bg-white shadow-[0_12px_24px_-12px_rgba(0,0,0,.12)] lg:block">
          <div className="container-x grid grid-cols-4 gap-8 py-8">
            <div className={`col-span-3 grid gap-8 ${item.groups.length === 1 ? "grid-cols-1" : item.groups.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {item.groups.map((g) => (
                <div key={g.title}>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{g.title}</p>
                  <ul className="space-y-1">
                    {g.links.map((l) => <li key={l.label}><NavAnchor link={l} onNavigate={() => setOpen(null)} /></li>)}
                  </ul>
                </div>
              ))}
            </div>
            <Link href={item.featured.href} onClick={() => setOpen(null)}
              className="group flex flex-col justify-between rounded-bento border border-line bg-bento p-5 hover:border-ink/20">
              <div>
                <p className="eyebrow">{item.featured.eyebrow}</p>
                <p className="mt-2 text-xl font-semibold tracking-tight">{item.featured.title}</p>
                <p className="mt-1 text-sm text-muted">{item.featured.desc}</p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium">
                {item.featured.cta} <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          </div>
        </div>
      ))}

      {/* Drawer mobile — di-portal ke <body>: header memakai backdrop-filter yang mengurung position:fixed */}
      {mobile && createPortal(
        <div id="mobile-nav" role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-50 overflow-y-auto bg-white lg:hidden">
          <div className="container-x flex h-16 items-center justify-between border-b border-line">
            <span className="text-[15px] font-semibold">Menu</span>
            <button type="button" aria-label="Tutup menu" className="grid size-9 place-items-center rounded-md hover:bg-tint" onClick={() => setMobile(false)}>
              <X aria-hidden className="size-5" />
            </button>
          </div>
          <ul className="container-x divide-y divide-line">
            {NAV.map((item, i) => (
              <li key={item.label}>
                <button type="button" aria-expanded={mobileSection === i}
                  className="flex w-full items-center justify-between py-4 text-left text-base font-medium"
                  onClick={() => setMobileSection(mobileSection === i ? null : i)}>
                  {item.label}
                  <ChevronDown aria-hidden className={`size-4 transition-transform ${mobileSection === i ? "rotate-180" : ""}`} />
                </button>
                {mobileSection === i && (
                  <div className="space-y-5 pb-5">
                    {item.groups.map((g) => (
                      <div key={g.title}>
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{g.title}</p>
                        <ul className="space-y-1">{g.links.map((l) => <li key={l.label}><NavAnchor link={l} onNavigate={() => setMobile(false)} /></li>)}</ul>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className="container-x py-6">
            <Link href="/hubungi-kami" className="btn-primary w-full" onClick={() => setMobile(false)}>Hubungi Kami</Link>
          </div>
        </div>,
        document.body,
      )}
    </nav>
  );
}
