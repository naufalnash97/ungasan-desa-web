import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function PageShell({ crumbs, eyebrow, title, summary, children }: {
  crumbs: { label: string; href?: string }[]; eyebrow?: string; title: string; summary?: string | null; children: React.ReactNode;
}) {
  return (
    <div className="container-x py-12 md:py-16">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex flex-wrap items-center gap-1 text-[13px] text-muted">
          <li><Link href="/" className="hover:text-ink">Beranda</Link></li>
          {crumbs.map((c) => (
            <li key={c.label} className="flex items-center gap-1">
              <ChevronRight aria-hidden className="size-3.5" />
              {c.href ? <Link href={c.href} className="hover:text-ink">{c.label}</Link> : <span aria-current="page" className="text-ink">{c.label}</span>}
            </li>
          ))}
        </ol>
      </nav>
      <header className="mb-10 max-w-3xl border-b border-line pb-8">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 text-[clamp(2rem,4.5vw,3rem)] font-semibold leading-[1.05] tracking-[-0.03em]">{title}</h1>
        {summary && <p className="mt-4 text-[1.0625rem] text-muted">{summary}</p>}
      </header>
      {children}
    </div>
  );
}
