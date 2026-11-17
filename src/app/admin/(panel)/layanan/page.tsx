import Link from "next/link";
import { asc } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireAdmin } from "@/lib/session";
import PageHeader, { Badge, Table } from "../../_ui/PageHeader";

export const metadata = { title: "Layanan" };

export default async function Page({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const { saved } = await searchParams;
  const rows = await db.select().from(s.services).orderBy(asc(s.services.sortOrder));
  return (
    <>
      <PageHeader title="Layanan" desc="Kartu di bento “Akses Layanan” beranda, urut sesuai kolom Urutan." action={{ href: "/admin/layanan/baru", label: "+ Layanan baru" }} />
      {saved && <p role="status" className="mb-4 rounded-btn border border-mint/40 bg-mint/10 px-3 py-2 text-sm text-mint-ink">Tersimpan.</p>}
      <Table head={["#", "Layanan", "Tautan", "Kartu", "Status", ""]} empty={!rows.length}>
        {rows.map((r) => (
          <tr key={r.id} className={r.active ? "" : "opacity-60"}>
            <td className="num px-4 py-3 text-muted">{r.sortOrder}</td>
            <td className="px-4 py-3"><Link href={`/admin/layanan/${r.id}`} className="font-medium hover:underline">{r.name}</Link><span className="block text-[12px] text-muted">{r.tagline}</span></td>
            <td className="max-w-[220px] truncate px-4 py-3 font-mono text-[12px] text-muted">{r.url}</td>
            <td className="px-4 py-3 uppercase text-muted">{r.bentoSpan}</td>
            <td className="px-4 py-3">{!r.active ? <Badge>Disembunyikan</Badge> : r.status === "ONLINE" ? <Badge tone="green">Online</Badge> : <Badge>Info</Badge>}</td>
            <td className="px-4 py-3 text-right"><Link href={`/admin/layanan/${r.id}`} className="text-[13px] font-medium hover:underline">Ubah</Link></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
