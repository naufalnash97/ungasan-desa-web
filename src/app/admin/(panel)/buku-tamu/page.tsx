import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { db, schema as s } from "@/db";
import { requireAdmin } from "@/lib/session";
import PageHeader, { Badge, Table } from "../../_ui/PageHeader";
import ConfirmButton from "../../_ui/ConfirmButton";
import { deleteGuest, toggleGuest } from "./actions";

export const metadata = { title: "Buku Tamu" };

export default async function Page({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  await requireAdmin();
  const pending = (await searchParams).filter === "baru";
  const rows = await db.select().from(s.guestbookEntries).where(pending ? eq(s.guestbookEntries.approved, false) : undefined).orderBy(desc(s.guestbookEntries.createdAt)).limit(300);
  return (
    <>
      <PageHeader title="Buku Tamu" desc="Kunjungan yang dicatat warga lewat /layanan/buku-tamu. IP disimpan sebagai hash." />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <nav aria-label="Filter" className="flex gap-2">
          <Link href="/admin/buku-tamu" className={`btn btn-sm ${!pending ? "bg-ink text-white" : "border border-line bg-white"}`}>Semua</Link>
          <Link href="/admin/buku-tamu?filter=baru" className={`btn btn-sm ${pending ? "bg-ink text-white" : "border border-line bg-white"}`}>Belum ditinjau</Link>
        </nav>
        <a href="/admin/buku-tamu/export" className="btn-secondary btn-sm">Unduh CSV</a>
      </div>
      <Table head={["Waktu", "Nama & asal", "Keperluan / pesan", "Status", ""]} empty={!rows.length}>
        {rows.map((r) => (
          <tr key={r.id} className="align-top">
            <td className="whitespace-nowrap px-4 py-3 text-[12.5px] text-muted">{r.createdAt.toLocaleString("id-ID", { timeZone: "Asia/Makassar", dateStyle: "medium", timeStyle: "short" })}</td>
            <td className="px-4 py-3"><span className="font-medium">{r.name}</span><span className="block text-[12.5px] text-muted">{r.origin}</span></td>
            <td className="max-w-sm px-4 py-3">{r.purpose}{r.message && <span className="mt-1 block whitespace-pre-line text-[12.5px] text-muted">{r.message}</span>}</td>
            <td className="px-4 py-3">{r.approved ? <Badge tone="green">Ditinjau</Badge> : <Badge tone="orange">Baru</Badge>}</td>
            <td className="whitespace-nowrap px-4 py-3 text-right">
              <form action={toggleGuest.bind(null, r.id)} className="inline"><button className="btn-secondary btn-sm mr-2">{r.approved ? "Tandai baru" : "Tandai ditinjau"}</button></form>
              <form action={deleteGuest.bind(null, r.id)} className="inline"><ConfirmButton message={`Hapus entri dari ${r.name}?`} /></form>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
