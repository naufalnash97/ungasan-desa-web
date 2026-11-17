import Link from "next/link";
import PageShell from "@/components/PageShell";
import { PostItem } from "@/components/NewsSection";
import { getPosts, type PostCategory } from "@/lib/data";

export const metadata = { title: "Berita" };
const TABS: { key?: PostCategory; label: string }[] = [{ label: "Semua" }, { key: "BERITA", label: "Berita" }, { key: "PENGUMUMAN", label: "Pengumuman & Lelang" }, { key: "VIDEO", label: "Video" }];

export default async function Page({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  const k = (await searchParams).kategori?.toUpperCase();
  const cat = TABS.find((t) => t.key === k)?.key;
  const posts = await getPosts({ category: cat, limit: 30 });
  return (
    <PageShell crumbs={[{ label: "Berita" }]} eyebrow="Kabar desa" title="Berita & Pengumuman">
      <nav aria-label="Kategori" className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link key={t.label} href={t.key ? `/berita?kategori=${t.key}` : "/berita"} aria-current={cat === t.key ? "page" : undefined}
            className={`btn btn-sm ${cat === t.key ? "bg-ink text-white" : "border border-line hover:bg-tint"}`}>{t.label}</Link>
        ))}
      </nav>
      <ul className="max-w-3xl divide-y divide-line">{posts.map((p) => <PostItem key={p.slug} p={p} />)}</ul>
      {!posts.length && <p className="text-muted">Belum ada konten di kategori ini.</p>}
    </PageShell>
  );
}
