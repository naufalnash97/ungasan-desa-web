"use server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema as s } from "@/db";
import { audit, requireAdmin, revokeOtherSessions, verifyPassword, hashPassword } from "@/lib/session";
import type { ActionState } from "../../_ui/types";
import { fromZod } from "../../_ui/util";

const schema = z.object({
  current: z.string().min(1, "Wajib diisi"),
  next: z.string().min(12, "Minimal 12 karakter").max(200),
  confirm: z.string(),
}).refine((d) => d.next === d.confirm, { path: ["confirm"], message: "Konfirmasi tidak sama" });

export async function changePassword(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const parsed = schema.safeParse({ current: fd.get("current"), next: fd.get("next"), confirm: fd.get("confirm") });
  if (!parsed.success) return fromZod(parsed.error);
  const [u] = await db.select({ hash: s.adminUsers.passwordHash }).from(s.adminUsers).where(eq(s.adminUsers.id, me.id));
  if (!u || !(await verifyPassword(parsed.data.current, u.hash))) return { message: "Password saat ini salah.", fieldErrors: { current: ["Password salah"] } };
  await db.update(s.adminUsers).set({ passwordHash: await hashPassword(parsed.data.next) }).where(eq(s.adminUsers.id, me.id));
  await revokeOtherSessions(me.id); // cookie curian di perangkat lain langsung tidak berlaku
  await audit(me, "UPDATE", "admin_user", me.id, "Ganti password sendiri");
  return { ok: true, message: "Password berhasil diganti. Sesi di perangkat lain telah dikeluarkan." };
}
