"use server";
import { revalidatePath } from "next/cache";
import { and, eq, ne, not } from "drizzle-orm";
import { z } from "zod";
import { db, schema as s } from "@/db";
import { audit, hashPassword, requireAdmin } from "@/lib/session";
import type { ActionState } from "../../_ui/types";
import { fromZod, isUniqueViolation, str } from "../../_ui/util";

const password = z.string().min(12, "Minimal 12 karakter").max(200);
const schema = z.object({
  email: z.string().trim().toLowerCase().email("Email tidak valid"),
  name: z.string().trim().min(2, "Nama wajib diisi").max(100),
  role: z.enum(["ADMIN", "EDITOR"]),
  password,
});

export async function createUser(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin("ADMIN");
  const parsed = schema.safeParse({ email: str(fd, "email"), name: str(fd, "name"), role: str(fd, "role"), password: fd.get("password") });
  if (!parsed.success) return fromZod(parsed.error);
  const { password: pw, ...rest } = parsed.data;
  try {
    const [row] = await db.insert(s.adminUsers).values({ ...rest, passwordHash: await hashPassword(pw) }).returning({ id: s.adminUsers.id });
    await audit(me, "CREATE", "admin_user", row.id, `Tambah pengguna ${rest.email} (${rest.role})`);
  } catch (e) {
    if (isUniqueViolation(e)) return { message: "Email sudah terdaftar.", fieldErrors: { email: ["Email sudah terdaftar"] } };
    throw e;
  }
  revalidatePath("/admin/pengguna");
  return { ok: true, message: `Pengguna ${rest.email} dibuat. Sampaikan password secara langsung, bukan lewat grup chat.` };
}

export async function resetPassword(id: number, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin("ADMIN");
  const parsed = password.safeParse(fd.get("password"));
  if (!parsed.success) return { message: parsed.error.issues[0].message };
  await db.update(s.adminUsers).set({ passwordHash: await hashPassword(parsed.data) }).where(eq(s.adminUsers.id, id));
  await db.delete(s.adminSessions).where(eq(s.adminSessions.userId, id)); // paksa login ulang
  await audit(me, "UPDATE", "admin_user", id, "Reset password");
  return { ok: true, message: "Password direset; sesi lama pengguna itu dicabut." };
}

export async function toggleActive(id: number) {
  const me = await requireAdmin("ADMIN");
  if (id === me.id) return; // tidak bisa menonaktifkan diri sendiri
  await db.update(s.adminUsers).set({ active: not(s.adminUsers.active) }).where(eq(s.adminUsers.id, id));
  await db.delete(s.adminSessions).where(eq(s.adminSessions.userId, id));
  await audit(me, "UPDATE", "admin_user", id, "Ubah status aktif");
  revalidatePath("/admin/pengguna");
}

export async function setRole(id: number, role: "ADMIN" | "EDITOR") {
  const me = await requireAdmin("ADMIN");
  // argumen server action datang dari klien — tipe TS tidak berlaku saat runtime
  const r = z.enum(["ADMIN", "EDITOR"]).safeParse(role);
  if (!r.success || !Number.isInteger(id) || id === me.id) return; // cegah admin menurunkan dirinya sendiri
  const changed = await db.update(s.adminUsers).set({ role: r.data }).where(and(eq(s.adminUsers.id, id), ne(s.adminUsers.role, r.data))).returning({ id: s.adminUsers.id });
  if (changed.length) await audit(me, "UPDATE", "admin_user", id, `Ubah peran → ${r.data}`);
  revalidatePath("/admin/pengguna");
}
