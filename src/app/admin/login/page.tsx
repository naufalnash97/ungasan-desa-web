import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/session";
import AdminForm from "../_ui/AdminForm";
import { SubmitButton, TextField } from "../_ui/fields";
import { login } from "./actions";

export const metadata = { title: "Masuk Panel Admin", robots: { index: false } };

export default async function LoginPage() {
  if (await getCurrentAdmin()) redirect("/admin");
  return (
    <main className="grid min-h-dvh place-items-center bg-bento px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <span aria-hidden className="grid size-9 place-items-center rounded-md bg-ink text-sm font-bold text-white">U</span>
          <div className="leading-tight">
            <p className="font-semibold">Panel Admin</p>
            <p className="text-[12px] text-muted">Website Desa Ungasan</p>
          </div>
        </div>
        <div className="rounded-kpi border border-line bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,.04)]">
          <h1 className="mb-5 text-lg font-semibold">Masuk</h1>
          <AdminForm action={login}>
            <TextField name="email" label="Email" type="email" autoComplete="username" required />
            <TextField name="password" label="Password" type="password" autoComplete="current-password" required />
            <SubmitButton className="btn-primary w-full">Masuk</SubmitButton>
          </AdminForm>
        </div>
        <p className="mt-4 text-center text-[12px] text-muted">Akun dibuat oleh administrator lewat <code>npm run admin:create</code>.</p>
      </div>
    </main>
  );
}
