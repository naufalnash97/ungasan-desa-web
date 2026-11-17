import AdminForm from "../../_ui/AdminForm";
import MarkdownField from "../../_ui/MarkdownField";
import { Checkbox, SelectField, SubmitButton, TextField } from "../../_ui/fields";
import { savePost } from "./actions";

type Post = { id: number; category: string; title: string; slug: string; excerpt: string | null; body: string; coverUrl: string | null; videoUrl: string | null; publishedAt: Date; published: boolean };

const toLocal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);

export default function PostForm({ post, defaultCategory = "BERITA" }: { post?: Post; defaultCategory?: string }) {
  return (
    <AdminForm action={savePost.bind(null, post?.id ?? null)} className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <TextField name="title" label="Judul" defaultValue={post?.title} required maxLength={200} />
        <TextField name="excerpt" label="Ringkasan" defaultValue={post?.excerpt ?? ""} maxLength={300} hint="Tampil di daftar berita (maks. 300 karakter)" />
        <MarkdownField name="body" label="Isi" defaultValue={post?.body} />
      </div>
      <div className="space-y-5">
        <div className="space-y-5 rounded-kpi border border-line-soft bg-white p-5">
          <SelectField name="category" label="Kategori" defaultValue={post?.category ?? defaultCategory}
            options={[{ value: "BERITA", label: "Berita" }, { value: "PENGUMUMAN", label: "Pengumuman / Lelang" }, { value: "VIDEO", label: "Video" }]} />
          <TextField name="publishedAt" label="Tanggal terbit" type="datetime-local" defaultValue={toLocal(post?.publishedAt ?? new Date())} />
          <Checkbox name="published" label="Tampilkan di situs" defaultChecked={post?.published ?? true} />
          <SubmitButton className="btn-primary w-full">{post ? "Simpan perubahan" : "Terbitkan"}</SubmitButton>
        </div>
        <div className="space-y-5 rounded-kpi border border-line-soft bg-white p-5">
          <TextField name="slug" label="Slug URL" defaultValue={post?.slug} hint="Kosongkan untuk dibuat otomatis dari judul" />
          <TextField name="coverUrl" label="URL gambar sampul" type="url" defaultValue={post?.coverUrl ?? ""} />
          <TextField name="videoUrl" label="URL video (YouTube)" type="url" defaultValue={post?.videoUrl ?? ""} />
        </div>
      </div>
    </AdminForm>
  );
}
