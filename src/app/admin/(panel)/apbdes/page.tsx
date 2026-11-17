import Link from "next/link";
import { asc, desc, eq, sql } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireAdmin } from "@/lib/session";
import { rupiahRingkas, tanggal } from "@/lib/format";
import PageHeader, { Badge, Table } from "../../_ui/PageHeader";
import AdminForm from "../../_ui/AdminForm";
import { SelectField, SubmitButton, TextField } from "../../_ui/fields";
import { createBudget } from "./actions";

export const metadata = { title: "APBDes" };
const VERSION = { MURNI: "Murni", PERUBAHAN: "Perubahan", PERUBAHAN_KEDUA: "Perubahan Kedua" } as const;

export default async function Page() {
  await requireAdmin();
  const rows = await db.select({
    id: s.budgets.id, year: s.budgets.year, version: s.budgets.version, asOf: s.budgets.asOf, isCurrent: s.budgets.isCurrent,
    lines: sql<number>`count(${s.budgetLines.id})::int`,
    pendapatan: sql<number>`coalesce(max(case when ${s.budgetLines.group} = 'PENDAPATAN' and ${s.budgetLines.isTotal} then ${s.budgetLines.planned} end), 0)::bigint`,
  }).from(s.budgets).leftJoin(s.budgetLines, eq(s.budgetLines.budgetId, s.budgets.id))
    .groupBy(s.budgets.id).orderBy(desc(s.budgets.year), asc(s.budgets.version));
  return (
    <>
      <PageHeader title="APBDes" desc="Satu entri per tahun & versi. Versi bertanda “Beranda” yang tampil di halaman utama." />
      <Table head={["Tahun", "Versi", "Anggaran pendapatan", "Rincian", "Posisi data", ""]} empty={!rows.length}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="num px-4 py-3 font-medium">{r.year}</td>
            <td className="px-4 py-3">{VERSION[r.version]} {r.isCurrent && <Badge tone="green">Beranda</Badge>}</td>
            <td className="num px-4 py-3 text-muted">{Number(r.pendapatan) ? rupiahRingkas(Number(r.pendapatan)) : "—"}</td>
            <td className="num px-4 py-3 text-muted">{r.lines} baris</td>
            <td className="px-4 py-3 text-muted">{tanggal(r.asOf)}</td>
            <td className="px-4 py-3 text-right"><Link href={`/admin/apbdes/${r.id}`} className="text-[13px] font-medium hover:underline">Ubah</Link></td>
          </tr>
        ))}
      </Table>

      <section className="mt-10 rounded-kpi border border-line-soft bg-white p-5">
        <h2 className="font-semibold">Buat APBDes baru</h2>
        <p className="mt-1 text-sm text-muted">Untuk APBDes Perubahan, salin rincian dari versi sebelumnya lalu ubah angkanya. Realisasi salinan diatur ke nol.</p>
        <AdminForm action={createBudget} className="mt-4 grid items-end gap-4 sm:grid-cols-4">
          <TextField name="year" label="Tahun" type="number" min={2000} max={2100} defaultValue={new Date().getFullYear() + 1} />
          <SelectField name="version" label="Versi" options={Object.entries(VERSION).map(([value, label]) => ({ value, label }))} />
          <SelectField name="copyFrom" label="Salin rincian dari" options={[{ value: "", label: "— kosong —" }, ...rows.map((r) => ({ value: String(r.id), label: `${r.year} ${VERSION[r.version]}` }))]} />
          <SubmitButton>Buat</SubmitButton>
        </AdminForm>
      </section>
    </>
  );
}
