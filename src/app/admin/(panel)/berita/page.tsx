import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireAdmin } from "@/lib/session";
import { tanggal } from "@/lib/format";
import PageHeader, { Badge, Table } from "../../_ui/PageHeader";

export const metadata = { title: "Berita & Pengumuman" };
const CATS = [["", "Semua"], ["BERITA", "Berita"], ["PENGUMUMAN", "Pengumuman"], ["VIDEO", "Video"]] as const;

export default async function Page({ searchParams }: { searchParams: Promise<{ kategori?: string; saved?: string }> }) {
  await requireAdmin();
  const { kategori, saved } = await searchParams;
  const cat = CATS.find(([k]) => k && k === kategori)?.[0];
  const rows = await db.select({ id: s.posts.id, title: s.posts.title, slug: s.posts.slug, category: s.posts.category, publishedAt: s.posts.publishedAt, published: s.posts.published })
    .from(s.posts).where(cat ? eq(s.posts.category, cat) : undefined).orderBy(desc(s.posts.publishedAt)).limit(200);
  return (
    <>
      <PageHeader title="Berita & Pengumuman" desc="Termasuk pengumuman lelang dan video." action={{ href: `/admin/berita/baru${cat ? `?kategori=${cat}` : ""}`, label: "+ Tulis baru" }} />
      {saved && <p role="status" className="mb-4 rounded-btn border border-mint/40 bg-mint/10 px-3 py-2 text-sm text-mint-ink">Tersimpan.</p>}
      <nav aria-label="Filter kategori" className="mb-4 flex flex-wrap gap-2">
        {CATS.map(([k, l]) => (
          <Link key={l} href={k ? `/admin/berita?kategori=${k}` : "/admin/berita"} aria-current={(cat ?? "") === k ? "page" : undefined}
            className={`btn btn-sm ${(cat ?? "") === k ? "bg-ink text-white" : "border border-line bg-white hover:bg-tint"}`}>{l}</Link>
        ))}
      </nav>
      <Table head={["Judul", "Kategori", "Tanggal", "Status", ""]} empty={!rows.length}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="px-4 py-3"><Link href={`/admin/berita/${r.id}`} className="font-medium hover:underline">{r.title}</Link></td>
            <td className="px-4 py-3 text-muted">{r.category.toLowerCase()}</td>
            <td className="whitespace-nowrap px-4 py-3 text-muted">{tanggal(r.publishedAt)}</td>
            <td className="px-4 py-3">{r.published ? <Badge tone="green">Terbit</Badge> : <Badge>Draf</Badge>}</td>
            <td className="whitespace-nowrap px-4 py-3 text-right">
              <a href={`/berita/${r.slug}`} target="_blank" className="mr-3 text-[13px] text-muted hover:text-ink">Lihat ↗</a>
              <Link href={`/admin/berita/${r.id}`} className="text-[13px] font-medium hover:underline">Ubah</Link>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
