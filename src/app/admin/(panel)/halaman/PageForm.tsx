import AdminForm from "../../_ui/AdminForm";
import MarkdownField from "../../_ui/MarkdownField";
import { Checkbox, SelectField, SubmitButton, TextField } from "../../_ui/fields";
import { savePage } from "./actions";

type P = { id: number; section: string; title: string; slug: string; summary: string | null; body: string; externalUrl: string | null; sortOrder: number; published: boolean };
export const SECTIONS = [
  { value: "PROFIL", label: "Profil" }, { value: "PEMERINTAHAN", label: "Pemerintahan" },
  { value: "TRANSPARANSI", label: "Transparansi" }, { value: "LAYANAN", label: "Layanan" },
];

export default function PageForm({ page }: { page?: P }) {
  return (
    <AdminForm action={savePage.bind(null, page?.id ?? null)} className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <TextField name="title" label="Judul" defaultValue={page?.title} required />
        <TextField name="summary" label="Ringkasan" defaultValue={page?.summary ?? ""} maxLength={300} />
        <MarkdownField name="body" label="Isi halaman" defaultValue={page?.body} rows={18} />
      </div>
      <div className="space-y-5 rounded-kpi border border-line-soft bg-white p-5 self-start">
        <SelectField name="section" label="Bagian menu" defaultValue={page?.section ?? "PROFIL"} options={SECTIONS} />
        <TextField name="slug" label="Slug URL" defaultValue={page?.slug} hint="Kosongkan untuk dibuat otomatis" />
        <TextField name="externalUrl" label="Tautan eksternal" type="url" defaultValue={page?.externalUrl ?? ""} hint="Isi bila halaman mengarah ke sistem lain (mis. SiLagas)" />
        <TextField name="sortOrder" label="Urutan" type="number" min={0} defaultValue={page?.sortOrder ?? 0} />
        <Checkbox name="published" label="Tampilkan di situs" defaultChecked={page?.published ?? true} />
        <SubmitButton className="btn-primary w-full">{page ? "Simpan perubahan" : "Buat halaman"}</SubmitButton>
      </div>
    </AdminForm>
  );
}
