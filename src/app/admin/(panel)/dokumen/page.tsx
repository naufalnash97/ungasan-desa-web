import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { db, schema as s } from "@/db";
import { requireAdmin } from "@/lib/session";
import PageHeader, { Table } from "../../_ui/PageHeader";
import AdminForm from "../../_ui/AdminForm";
import ConfirmButton from "../../_ui/ConfirmButton";
import { SelectField, SubmitButton, TextField } from "../../_ui/fields";
import FileField from "./FileField";
import { createDocument, deleteDocument } from "./actions";

export const metadata = { title: "Dokumen" };
const LABEL: Record<string, string> = {
  APBDES: "APBDes", INFOGRAFIS: "Infografis", REALISASI: "Laporan Realisasi", LPPDES: "LPPDes", LKPPDES: "LKPPDes", LPPD_AMJ: "LPPD AMJ",
  RPJM: "RPJM", RKP: "RKP", BLT_DD: "BLT DD", PPID: "PPID", PRODUK_HUKUM: "Produk Hukum", ASET: "Aset", ARSIP: "Arsip", BUMDES: "BUMDesa", LAINNYA: "Lainnya",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  await requireAdmin();
  const k = (await searchParams).kategori;
  const cat = s.documentCategoryEnum.enumValues.find((v) => v === k);
  const rows = await db.select().from(s.documents).where(cat ? eq(s.documents.category, cat) : undefined).orderBy(desc(s.documents.year), desc(s.documents.publishedAt));
  return (
    <>
      <PageHeader title="Dokumen" desc="Arsip transparansi: APBDes, LPPDes, RPJM, SK BLT DD, dan lainnya." />
      <section className="mb-8 rounded-kpi border border-line-soft bg-white p-5">
        <h2 className="font-semibold">Tambah dokumen</h2>
        <AdminForm action={createDocument} resetOnSuccess className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextField name="title" label="Judul" placeholder="mis. APBDesa Perubahan 2026" required />
          <div className="grid grid-cols-2 gap-4">
            <SelectField name="category" label="Kategori" options={Object.entries(LABEL).map(([value, label]) => ({ value, label }))} />
            <TextField name="year" label="Tahun" type="number" min={1990} max={2100} defaultValue={new Date().getFullYear()} />
          </div>
          <FileField name="file" label="File (PDF/gambar, maks. 20 MB)" />
          <TextField name="fileUrl" label="…atau URL dokumen" type="url" placeholder="https://" hint="Dipakai bila tidak mengunggah file" />
          <div className="sm:col-span-2"><SubmitButton>Simpan dokumen</SubmitButton></div>
        </AdminForm>
      </section>
      <nav aria-label="Filter kategori" className="mb-4 flex flex-wrap gap-2">
        <Link href="/admin/dokumen" className={`btn btn-sm ${!cat ? "bg-ink text-white" : "border border-line bg-white hover:bg-tint"}`}>Semua</Link>
        {Object.entries(LABEL).map(([v, l]) => (
          <Link key={v} href={`/admin/dokumen?kategori=${v}`} className={`btn btn-sm ${cat === v ? "bg-ink text-white" : "border border-line bg-white hover:bg-tint"}`}>{l}</Link>
        ))}
      </nav>
      <Table head={["Judul", "Kategori", "Tahun", "Sumber", ""]} empty={!rows.length}>
        {rows.map((d) => (
          <tr key={d.id}>
            <td className="px-4 py-3"><a href={d.fileUrl} target="_blank" className="font-medium hover:underline">{d.title}</a></td>
            <td className="px-4 py-3 text-muted">{LABEL[d.category]}</td>
            <td className="num px-4 py-3 text-muted">{d.year ?? "—"}</td>
            <td className="px-4 py-3 text-[12px] text-muted">{d.fileUrl.startsWith("/uploads/") ? "Unggahan" : "Tautan"}</td>
            <td className="px-4 py-3 text-right">
              <form action={deleteDocument.bind(null, d.id)}><ConfirmButton message={`Hapus dokumen "${d.title}"?`} /></form>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
