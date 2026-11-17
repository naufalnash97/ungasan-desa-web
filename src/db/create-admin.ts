/**
 * Membuat / memperbarui akun admin. Tidak ada akun default — buat sendiri:
 *   ADMIN_EMAIL=operator@ungasan.desa.id ADMIN_NAME="Operator Desa" ADMIN_PASSWORD='...' npm run admin:create
 * Opsional ADMIN_ROLE=EDITOR (default ADMIN).
 */
import { db, schema as s } from "./index";
import { hashPassword } from "../lib/password";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const name = process.env.ADMIN_NAME?.trim() || "Administrator";
  const password = process.env.ADMIN_PASSWORD ?? "";
  const role = process.env.ADMIN_ROLE === "EDITOR" ? "EDITOR" : "ADMIN";
  if (!email || !/^[^\s@]+@[^\s@]+$/.test(email)) throw new Error("ADMIN_EMAIL tidak valid");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD minimal 12 karakter");
  const passwordHash = await hashPassword(password);
  await db.insert(s.adminUsers).values({ email, name, passwordHash, role })
    .onConflictDoUpdate({ target: s.adminUsers.email, set: { name, passwordHash, role, active: true } });
  console.log(`✔ Admin ${email} (${role}) siap. Login di /admin/login`);
}

main().then(() => process.exit(0)).catch((e) => { console.error("✖", e.message); process.exit(1); });
