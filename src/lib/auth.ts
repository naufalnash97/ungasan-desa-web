import { timingSafeEqual, createHash } from "node:crypto";
import { trustedClientIp } from "./client-ip";

/** Validasi header `Authorization: Bearer <ADMIN_API_TOKEN>` secara constant-time. */
export function isAdmin(req: Request) {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected || expected.length < 32) return false; // token lemah = admin dimatikan
  const got = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = createHash("sha256").update(got).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export function clientIp(req: Request) {
  return trustedClientIp((n) => req.headers.get(n));
}

export function hashIp(ip: string) {
  return createHash("sha256").update(ip + (process.env.IP_HASH_SALT ?? "")).digest("hex");
}
