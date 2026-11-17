import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import PageShell from "@/components/PageShell";
import { getPage, getPagesBySection, type Section } from "@/lib/data";
import { renderMarkdown } from "@/lib/markdown";

export const SECTION_META: Record<Section, { label: string; href: string; desc: string }> = {
  PROFIL: { label: "Profil", href: "/profil", desc: "Sejarah, wilayah, visi-misi, dan data Desa Ungasan." },
  PEMERINTAHAN: { label: "Pemerintahan", href: "/pemerintahan", desc: "Organisasi, regulasi, dan standar pelayanan pemerintah desa." },
  TRANSPARANSI: { label: "Transparansi", href: "/transparansi", desc: "Keuangan, perencanaan, program, dan informasi publik." },
  LAYANAN: { label: "Layanan", href: "/layanan", desc: "Alur layanan dan pengaduan." },
};

/** Index bagian: kartu dari tabel pages + tautan tambahan */
export async function SectionIndex({ section, extra = [] }: { section: Section; extra?: { title: string; summary: string; href: string }[] }) {
  const meta = SECTION_META[section];
  const pages = await getPagesBySection(section);
  const cards = [
    ...extra,
    ...pages.map((p) => ({ title: p.title, summary: p.summary ?? "", href: p.externalUrl ?? `${meta.href}/${p.slug}`, external: Boolean(p.externalUrl) })),
  ];
  return (
    <PageShell crumbs={[{ label: meta.label }]} eyebrow={meta.label} title={meta.label} summary={meta.desc}>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <li key={c.href}>
            <Link href={c.href} {...("external" in c && c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group flex h-full flex-col rounded-bento border border-[#e4e7e5] bg-white p-5 hover:border-ink/20">
              <span className="flex items-start justify-between gap-3 font-semibold">{c.title}<ArrowUpRight aria-hidden className="size-4 shrink-0 text-muted group-hover:text-ink" /></span>
              {c.summary && <span className="mt-1.5 text-[13.5px] text-muted">{c.summary}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}

/** Halaman konten generik */
export async function SectionPage({ section, slug }: { section: Section; slug: string }) {
  const meta = SECTION_META[section];
  const page = await getPage(section, slug);
  if (!page) notFound();
  return (
    <PageShell crumbs={[{ label: meta.label, href: meta.href }, { label: page.title }]} eyebrow={meta.label} title={page.title} summary={page.summary}>
      {page.externalUrl && (
        <a href={page.externalUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mb-8">
          Buka {new URL(page.externalUrl).hostname} <ArrowUpRight aria-hidden className="size-4" />
        </a>
      )}
      <article className="prose-desa" dangerouslySetInnerHTML={{ __html: renderMarkdown(page.body) }} />
    </PageShell>
  );
}

export async function sectionMetadata(section: Section, slug: string) {
  const page = await getPage(section, slug);
  return page ? { title: page.title, description: page.summary ?? undefined } : {};
}
