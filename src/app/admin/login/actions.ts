"use server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema as s } from "@/db";
import { audit, createSession, destroySession, getCurrentAdmin, getDummyHash, requestIp, verifyPassword } from "@/lib/session";
import { isLimited, rateLimit } from "@/lib/rate-limit";
import type { ActionState } from "../_ui/types";

const input = z.object({ email: z.string().trim().toLowerCase().email("Email tidak valid"), password: z.string().min(1, "Password wajib diisi").max(200) });

export async function login(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = input.safeParse({ email: fd.get("email"), password: fd.get("password") });
  if (!parsed.success) return { message: "Lengkapi email dan password.", fieldErrors: parsed.error.flatten().fieldErrors };
  const { email, password } = parsed.data;

  // Hanya percobaan GAGAL yang dihitung: 5 / 10 menit per email, 10 / 10 menit per IP.
  // IP "unknown" (tanpa proxy tepercaya) dipakai bersama semua orang → tidak dijadikan kunci,
  // agar satu penyerang tidak bisa mengunci login seluruh operator. Limit per-email tetap berlaku.
  const ip = await requestIp();
  const ipKey = ip === "unknown" ? null : `login-ip:${ip}`;
  const emailKey = `login-email:${email}`;
  if (isLimited(emailKey) || (ipKey && isLimited(ipKey))) return { message: "Terlalu banyak percobaan gagal. Coba lagi dalam beberapa menit." };

  const [user] = await db.select().from(s.adminUsers).where(eq(s.adminUsers.email, email)).limit(1);
  const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !user.active || !valid) {
    rateLimit(emailKey, 5, 10 * 60_000);
    if (ipKey) rateLimit(ipKey, 10, 10 * 60_000);
    return { message: "Email atau password salah." };
  }

  await createSession(user.id);
  await db.update(s.adminUsers).set({ lastLoginAt: new Date() }).where(eq(s.adminUsers.id, user.id));
  await audit({ id: user.id, email: user.email, name: user.name, role: user.role }, "LOGIN", "session", null, `Login dari ${ip}`);
  redirect("/admin");
}

export async function logout() {
  const user = await getCurrentAdmin();
  if (user) await audit(user, "LOGOUT", "session");
  await destroySession();
  redirect("/admin/login");
}
