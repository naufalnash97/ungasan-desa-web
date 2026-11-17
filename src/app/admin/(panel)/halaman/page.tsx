import Link from "next/link";
import { asc } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireAdmin } from "@/lib/session";
import PageHeader, { Badge, Table } from "../../_ui/PageHeader";
import { SECTIONS } from "./PageForm";

export const metadata = { title: "Halaman" };

export default async function Page({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const { saved } = await searchParams;
  const rows = await db.select().from(s.pages).orderBy(asc(s.pages.section), asc(s.pages.sortOrder));
  return (
    <>
      <PageHeader title="Halaman" desc="Konten statis di menu Profil, Pemerintahan, Transparansi, dan Layanan." action={{ href: "/admin/halaman/baru", label: "+ Halaman baru" }} />
      {saved && <p role="status" className="mb-4 rounded-btn border border-mint/40 bg-mint/10 px-3 py-2 text-sm text-mint-ink">Tersimpan.</p>}
      <div className="space-y-8">
        {SECTIONS.map((sec) => {
          const list = rows.filter((r) => r.section === sec.value);
          return (
            <section key={sec.value}>
              <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">{sec.label}</h2>
              <Table head={["Judul", "URL", "Status", ""]} empty={!list.length}>
                {list.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3"><Link href={`/admin/halaman/${r.id}`} className="font-medium hover:underline">{r.title}</Link></td>
                    <td className="px-4 py-3 font-mono text-[12px] text-muted">{r.externalUrl ? `↗ ${new URL(r.externalUrl).hostname}` : `/${sec.value.toLowerCase()}/${r.slug}`}</td>
                    <td className="px-4 py-3">{r.published ? <Badge tone="green">Terbit</Badge> : <Badge>Draf</Badge>}</td>
                    <td className="px-4 py-3 text-right"><Link href={`/admin/halaman/${r.id}`} className="text-[13px] font-medium hover:underline">Ubah</Link></td>
                  </tr>
                ))}
              </Table>
            </section>
          );
        })}
      </div>
    </>
  );
}
