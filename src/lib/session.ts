import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import { hashPassword } from "./password";
import { trustedClientIp } from "./client-ip";
export { hashPassword, verifyPassword } from "./password";
import { and, eq, gt, lt, ne } from "drizzle-orm";
import { db, schema as s } from "@/db";


export const SESSION_COOKIE = "ungasan_admin";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 jam (satu hari kerja)

export type AdminUser = { id: number; email: string; name: string; role: "ADMIN" | "EDITOR" };

/** Hash dummy agar waktu respons login sama untuk email yang tidak terdaftar (cegah enumerasi). */
let dummyHash: Promise<string> | null = null;
export const getDummyHash = () => (dummyHash ??= hashPassword("dummy-password-for-timing"));

// ─────────── Sesi ───────────
const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(s.adminSessions).values({ id: sha256(token), userId, expiresAt });
  await db.delete(s.adminSessions).where(lt(s.adminSessions.expiresAt, new Date())); // bersihkan sesi kedaluwarsa
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && !process.env.ALLOW_INSECURE_COOKIE,
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(s.adminSessions).where(eq(s.adminSessions.id, sha256(token)));
  jar.delete(SESSION_COOKIE);
}

/** Pengguna yang sedang login (di-cache per request). */
export const getCurrentAdmin = cache(async (): Promise<AdminUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [row] = await db
    .select({ id: s.adminUsers.id, email: s.adminUsers.email, name: s.adminUsers.name, role: s.adminUsers.role })
    .from(s.adminSessions)
    .innerJoin(s.adminUsers, eq(s.adminUsers.id, s.adminSessions.userId))
    .where(and(eq(s.adminSessions.id, sha256(token)), gt(s.adminSessions.expiresAt, new Date()), eq(s.adminUsers.active, true)))
    .limit(1);
  return row ?? null;
});

/** Wajib dipanggil di setiap halaman & server action admin. */
export async function requireAdmin(role?: "ADMIN") {
  const user = await getCurrentAdmin();
  if (!user) redirect("/admin/login");
  if (role === "ADMIN" && user.role !== "ADMIN") redirect("/admin?forbidden=1");
  return user;
}

export async function requestIp() {
  const h = await headers();
  return trustedClientIp((n) => h.get(n));
}

/** Cabut semua sesi pengguna KECUALI sesi yang sedang dipakai (setelah ganti password). */
export async function revokeOtherSessions(userId: number) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  await db.delete(s.adminSessions).where(and(eq(s.adminSessions.userId, userId), token ? ne(s.adminSessions.id, sha256(token)) : undefined));
}

// ─────────── Audit ───────────
export async function audit(user: AdminUser | null, action: string, entity: string, entityId?: string | number | null, summary?: string) {
  await db.insert(s.auditLogs).values({
    userId: user?.id ?? null, action, entity, entityId: entityId == null ? null : String(entityId), summary: summary?.slice(0, 300),
  });
}
