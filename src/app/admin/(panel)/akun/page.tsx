import { requireAdmin } from "@/lib/session";
import PageHeader from "../../_ui/PageHeader";
import AdminForm from "../../_ui/AdminForm";
import { SubmitButton, TextField } from "../../_ui/fields";
import { changePassword } from "./actions";

export const metadata = { title: "Akun saya" };
export default async function Page() {
  const me = await requireAdmin();
  return (
    <>
      <PageHeader title="Akun saya" desc={`${me.name} · ${me.email}`} />
      <section className="max-w-md rounded-kpi border border-line-soft bg-white p-5">
        <h2 className="font-semibold">Ganti password</h2>
        <AdminForm action={changePassword} resetOnSuccess className="mt-4 space-y-4">
          <TextField name="current" label="Password saat ini" type="password" autoComplete="current-password" />
          <TextField name="next" label="Password baru" type="password" autoComplete="new-password" hint="Minimal 12 karakter" />
          <TextField name="confirm" label="Ulangi password baru" type="password" autoComplete="new-password" />
          <SubmitButton>Ganti password</SubmitButton>
        </AdminForm>
      </section>
    </>
  );
}
