import { asc } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireAdmin } from "@/lib/session";
import PageHeader, { Badge, Table } from "../../_ui/PageHeader";
import AdminForm from "../../_ui/AdminForm";
import { SelectField, SubmitButton, TextField } from "../../_ui/fields";
import { createUser, resetPassword, setRole, toggleActive } from "./actions";

export const metadata = { title: "Pengguna" };

export default async function Page() {
  const me = await requireAdmin("ADMIN");
  const users = await db.select({ id: s.adminUsers.id, email: s.adminUsers.email, name: s.adminUsers.name, role: s.adminUsers.role, active: s.adminUsers.active, lastLoginAt: s.adminUsers.lastLoginAt })
    .from(s.adminUsers).orderBy(asc(s.adminUsers.name));
  return (
    <>
      <PageHeader title="Pengguna" desc="Admin: semua akses termasuk pengguna & log audit. Editor: hanya konten." />
      <Table head={["Nama", "Peran", "Login terakhir", "Status", "Aksi"]}>
        {users.map((u) => (
          <tr key={u.id} className="align-top">
            <td className="px-4 py-3"><span className="font-medium">{u.name}</span>{u.id === me.id && <span className="ml-1 text-[12px] text-muted">(Anda)</span>}<span className="block text-[12.5px] text-muted">{u.email}</span></td>
            <td className="px-4 py-3">
              {u.id === me.id ? <Badge>{u.role}</Badge> : (
                <form action={setRole.bind(null, u.id, u.role === "ADMIN" ? "EDITOR" : "ADMIN")}>
                  <Badge>{u.role}</Badge> <button className="ml-1 text-[12px] underline underline-offset-2">jadikan {u.role === "ADMIN" ? "editor" : "admin"}</button>
                </form>
              )}
            </td>
            <td className="px-4 py-3 text-[12.5px] text-muted">{u.lastLoginAt ? u.lastLoginAt.toLocaleString("id-ID", { timeZone: "Asia/Makassar", dateStyle: "medium", timeStyle: "short" }) : "Belum pernah"}</td>
            <td className="px-4 py-3">{u.active ? <Badge tone="green">Aktif</Badge> : <Badge tone="orange">Nonaktif</Badge>}</td>
            <td className="px-4 py-3 text-right">
              {u.id !== me.id && (
                <div className="flex flex-col items-end gap-2">
                  <form action={toggleActive.bind(null, u.id)}><button className="btn-secondary btn-sm">{u.active ? "Nonaktifkan" : "Aktifkan"}</button></form>
                  <AdminForm action={resetPassword.bind(null, u.id)} resetOnSuccess className="flex items-center gap-2">
                    <input name="password" type="password" aria-label={`Password baru untuk ${u.name}`} placeholder="Password baru" autoComplete="new-password" className="w-36 rounded border border-line px-2 py-1 text-[12.5px]" />
                    <SubmitButton className="btn-secondary btn-sm">Reset</SubmitButton>
                  </AdminForm>
                </div>
              )}
            </td>
          </tr>
        ))}
      </Table>
      <section className="mt-8 rounded-kpi border border-line-soft bg-white p-5">
        <h2 className="font-semibold">Tambah pengguna</h2>
        <AdminForm action={createUser} resetOnSuccess className="mt-4 grid items-end gap-4 sm:grid-cols-2">
          <TextField name="name" label="Nama" autoComplete="off" />
          <TextField name="email" label="Email" type="email" autoComplete="off" />
          <SelectField name="role" label="Peran" options={[{ value: "EDITOR", label: "Editor — konten saja" }, { value: "ADMIN", label: "Admin — akses penuh" }]} />
          <TextField name="password" label="Password awal" type="password" autoComplete="new-password" hint="Minimal 12 karakter" />
          <div className="sm:col-span-2"><SubmitButton>Tambah pengguna</SubmitButton></div>
        </AdminForm>
      </section>
    </>
  );
}
