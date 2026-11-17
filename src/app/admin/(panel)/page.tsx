import Link from "next/link";
import { count, desc, eq, sql } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireAdmin } from "@/lib/session";
import { tanggal } from "@/lib/format";
import { Badge } from "../_ui/PageHeader";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ forbidden?: string }> }) {
  const user = await requireAdmin();
  const { forbidden } = await searchParams;
  const [[posts], [pages], [docs], [guests], current, recent] = await Promise.all([
    db.select({ n: count() }).from(s.posts),
    db.select({ n: count() }).from(s.pages),
    db.select({ n: count() }).from(s.documents),
    db.select({ n: count() }).from(s.guestbookEntries).where(eq(s.guestbookEntries.approved, false)),
    db.select({ year: s.budgets.year, version: s.budgets.version, asOf: s.budgets.asOf }).from(s.budgets).where(eq(s.budgets.isCurrent, true)).limit(1),
    db.select({ action: s.auditLogs.action, entity: s.auditLogs.entity, summary: s.auditLogs.summary, at: s.auditLogs.createdAt, who: s.adminUsers.name })
      .from(s.auditLogs).leftJoin(s.adminUsers, eq(s.adminUsers.id, s.auditLogs.userId)).orderBy(desc(s.auditLogs.createdAt)).limit(8),
  ]);
  const cards = [
    { label: "Berita & pengumuman", value: posts.n, href: "/admin/berita" },
    { label: "Halaman konten", value: pages.n, href: "/admin/halaman" },
    { label: "Dokumen", value: docs.n, href: "/admin/dokumen" },
    { label: "Buku tamu belum ditinjau", value: guests.n, href: "/admin/buku-tamu" },
  ];
  const b = current[0];
  return (
    <>
      {forbidden && <p role="alert" className="mb-6 rounded-btn border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">Halaman itu hanya untuk peran Admin.</p>}
      <p className="eyebrow">Dasbor</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Halo, {user.name.split(" ")[0]}.</h1>
      <p className="mt-1 text-sm text-muted">Perubahan yang Anda simpan langsung tampil di situs publik.</p>

      <dl className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card-kpi bg-white p-5 hover:border-ink/20">
            <dt className="text-[13px] text-muted">{c.label}</dt>
            <dd className="num mt-2 text-3xl font-semibold tracking-tight">{c.value}</dd>
          </Link>
        ))}
      </dl>

      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        <div className="card-kpi bg-white p-5">
          <p className="text-[13px] text-muted">APBDes di beranda</p>
          {b ? <p className="mt-2 text-xl font-semibold">{b.year} · {b.version.replace("_", " ").toLowerCase()}</p> : <p className="mt-2 text-muted">Belum diatur</p>}
          {b && <p className="mt-1 text-[12.5px] text-muted">posisi {tanggal(b.asOf)}</p>}
          <Link href="/admin/apbdes" className="btn-secondary btn-sm mt-4">Kelola APBDes</Link>
        </div>
        <div className="card-kpi bg-white p-5 lg:col-span-2">
          <p className="text-[13px] text-muted">Aksi cepat</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/admin/berita/baru?kategori=BERITA" className="btn-primary btn-sm">+ Berita</Link>
            <Link href="/admin/berita/baru?kategori=PENGUMUMAN" className="btn-secondary btn-sm">+ Pengumuman</Link>
            <Link href="/admin/dokumen" className="btn-secondary btn-sm">Unggah dokumen</Link>
            <Link href="/admin/statistik" className="btn-secondary btn-sm">Perbarui statistik</Link>
          </div>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Aktivitas terbaru</h2>
      <ul className="mt-3 divide-y divide-line-soft rounded-kpi border border-line-soft bg-white">
        {recent.map((r, i) => (
          <li key={i} className="flex items-center justify-between gap-4 px-4 py-3 text-[13.5px]">
            <span><Badge tone={r.action === "DELETE" ? "orange" : r.action === "CREATE" ? "green" : "gray"}>{r.action}</Badge> <span className="ml-1">{r.summary ?? r.entity}</span></span>
            <span className="shrink-0 text-[12px] text-muted">{r.who ?? "—"} · {new Date(r.at).toLocaleString("id-ID", { timeZone: "Asia/Makassar", dateStyle: "short", timeStyle: "short" })}</span>
          </li>
        ))}
        {!recent.length && <li className="px-4 py-6 text-center text-sm text-muted">Belum ada aktivitas.</li>}
      </ul>
    </>
  );
}
