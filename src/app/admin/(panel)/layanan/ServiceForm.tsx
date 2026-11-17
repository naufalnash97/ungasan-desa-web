import AdminForm from "../../_ui/AdminForm";
import { Checkbox, SelectField, SubmitButton, TextArea, TextField } from "../../_ui/fields";
import { saveService } from "./actions";
import { ICONS } from "./icons";

type S = { id: number; name: string; slug: string; tagline: string; description: string; url: string; icon: string; status: string; bentoSpan: string; sortOrder: number; active: boolean };

export default function ServiceForm({ svc }: { svc?: S }) {
  return (
    <AdminForm action={saveService.bind(null, svc?.id ?? null)} className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <TextField name="name" label="Nama layanan" defaultValue={svc?.name} required />
        <TextField name="tagline" label="Tagline" defaultValue={svc?.tagline} maxLength={80} />
        <TextArea name="description" label="Deskripsi" defaultValue={svc?.description} rows={3} maxLength={240} />
        <TextField name="url" label="Tautan" defaultValue={svc?.url} placeholder="https://silagas.id atau /layanan/alur-layanan" />
      </div>
      <div className="space-y-5 self-start rounded-kpi border border-line-soft bg-white p-5">
        <SelectField name="icon" label="Ikon" defaultValue={svc?.icon} options={ICONS.map((i) => ({ value: i, label: i }))} />
        <SelectField name="status" label="Status" defaultValue={svc?.status} options={[{ value: "ONLINE", label: "Online (chip hijau)" }, { value: "INFO", label: "Info" }]} />
        <SelectField name="bentoSpan" label="Ukuran kartu bento" defaultValue={svc?.bentoSpan ?? "sm"}
          options={[{ value: "xl", label: "XL — kartu utama 2 baris" }, { value: "lg", label: "L — setengah lebar" }, { value: "md", label: "M — seperempat" }, { value: "sm", label: "S — seperempat" }]} />
        <TextField name="sortOrder" label="Urutan" type="number" min={0} defaultValue={svc?.sortOrder ?? 0} />
        <TextField name="slug" label="Slug" defaultValue={svc?.slug} hint="Kosongkan untuk otomatis" />
        <Checkbox name="active" label="Tampilkan" defaultChecked={svc?.active ?? true} />
        <SubmitButton className="btn-primary w-full">Simpan</SubmitButton>
      </div>
    </AdminForm>
  );
}
