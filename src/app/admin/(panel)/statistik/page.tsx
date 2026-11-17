import Link from "next/link";
import { asc, desc, eq, sql } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireAdmin } from "@/lib/session";
import PageHeader from "../../_ui/PageHeader";
import AdminForm from "../../_ui/AdminForm";
import ConfirmButton from "../../_ui/ConfirmButton";
import { SelectField, SubmitButton, TextField } from "../../_ui/fields";
import { deleteStat, saveStat } from "./actions";

export const metadata = { title: "Statistik" };
const CATEGORIES = [
  ["RINGKASAN", "Ringkasan (Jumlah Penduduk, Jumlah KK)"], ["JENIS_KELAMIN", "Jenis kelamin"], ["PENDIDIKAN", "Pendidikan dalam KK"],
  ["PEKERJAAN", "Pekerjaan"], ["AGAMA", "Agama"], ["UMUR", "Kelompok umur"], ["DISABILITAS", "Penyandang disabilitas"],
  ["STUNTING", "Stunting"], ["BANJAR", "Wilayah / banjar"],
].map(([value, label]) => ({ value, label }));

export default async function Page({ searchParams }: { searchParams: Promise<{ tahun?: string }> }) {
  await requireAdmin();
  const years = (await db.selectDistinct({ y: s.populationStats.year }).from(s.populationStats).orderBy(desc(s.populationStats.year))).map((r) => r.y);
  const t = Number((await searchParams).tahun);
  const year = Number.isInteger(t) && t > 1999 ? t : years[0] ?? new Date().getFullYear();
  const rows = await db.select().from(s.populationStats).where(eq(s.populationStats.year, year)).orderBy(asc(s.populationStats.category), asc(s.populationStats.sortOrder));
  const today = new Date().toISOString().slice(0, 10);
  const cell = "w-full rounded border border-line bg-white px-2 py-1.5 text-[13px] num";
  return (
    <>
      <PageHeader title="Statistik kependudukan" desc="Beranda membaca baris RINGKASAN “Jumlah Penduduk” (kolom L/P/Total) dan “Jumlah KK” (Total)." />
      <nav aria-label="Tahun" className="mb-4 flex flex-wrap gap-2">
        {[...new Set([...years, year])].sort((a, b) => b - a).map((y) => (
          <Link key={y} href={`/admin/statistik?tahun=${y}`} className={`btn btn-sm ${y === year ? "bg-ink text-white" : "border border-line bg-white hover:bg-tint"}`}>{y}</Link>
        ))}
        <Link href={`/admin/statistik?tahun=${(years[0] ?? year) + 1}`} className="btn btn-sm border border-dashed border-line bg-white">+ Tahun {(years[0] ?? year) + 1}</Link>
      </nav>

      <div className="overflow-x-auto rounded-kpi border border-line-soft bg-white">
        <div className="grid min-w-[760px] grid-cols-[1.3fr_1.6fr_.8fr_.8fr_.8fr_auto] gap-2 border-b border-line-soft bg-card px-4 py-2.5 text-[11.5px] font-medium uppercase tracking-wide text-muted">
          <span>Kategori</span><span>Uraian</span><span>Laki-laki</span><span>Perempuan</span><span>Total</span><span className="w-32" />
        </div>
        {rows.map((r) => (
          <div key={r.id} className="flex min-w-[760px] items-start gap-2 border-b border-line-soft px-4 py-2 last:border-0">
            <AdminForm action={saveStat.bind(null, r.id)} className="grid flex-1 grid-cols-[1.3fr_1.6fr_.8fr_.8fr_.8fr_auto] items-center gap-2">
              <input type="hidden" name="year" value={year} /><input type="hidden" name="sortOrder" value={r.sortOrder} /><input type="hidden" name="asOf" value={today} />
              <input type="hidden" name="category" value={r.category} />
              <span className="text-[12.5px] text-muted">{r.category.replace("_", " ").toLowerCase()}</span>
              <input aria-label="Uraian" name="label" defaultValue={r.label} className={cell} />
              <input aria-label={`Laki-laki ${r.label}`} name="male" type="number" min={0} defaultValue={r.male} className={cell} />
              <input aria-label={`Perempuan ${r.label}`} name="female" type="number" min={0} defaultValue={r.female} className={cell} />
              <input aria-label={`Total ${r.label}`} name="total" type="number" min={0} defaultValue={r.total} className={cell} />
              <SubmitButton className="btn-secondary btn-sm">Simpan</SubmitButton>
            </AdminForm>
            <form action={deleteStat.bind(null, r.id)} className="pt-0.5"><ConfirmButton message={`Hapus baris "${r.label}"?`} /></form>
          </div>
        ))}
        {!rows.length && <p className="px-4 py-8 text-center text-sm text-muted">Belum ada data untuk {year}.</p>}
      </div>

      <section className="mt-8 rounded-kpi border border-line-soft bg-white p-5">
        <h2 className="font-semibold">Tambah baris {year}</h2>
        <AdminForm action={saveStat.bind(null, null)} resetOnSuccess className="mt-4 grid items-end gap-4 sm:grid-cols-6">
          <input type="hidden" name="year" value={year} /><input type="hidden" name="asOf" value={today} />
          <div className="sm:col-span-2"><SelectField name="category" label="Kategori" options={CATEGORIES} /></div>
          <div className="sm:col-span-2"><TextField name="label" label="Uraian" placeholder="mis. Tamat SLTA" /></div>
          <TextField name="male" label="Laki-laki" type="number" min={0} defaultValue={0} />
          <TextField name="female" label="Perempuan" type="number" min={0} defaultValue={0} />
          <TextField name="total" label="Total" type="number" min={0} hint="Kosong = L + P" />
          <TextField name="sortOrder" label="Urutan" type="number" min={0} defaultValue={rows.length} />
          <div className="sm:col-span-2"><SubmitButton>Tambah</SubmitButton></div>
        </AdminForm>
      </section>
    </>
  );
}
