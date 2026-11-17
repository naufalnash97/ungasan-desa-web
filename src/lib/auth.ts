import { timingSafeEqual, createHash } from "node:crypto";

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
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "0.0.0.0";
}

export function hashIp(ip: string) {
  return createHash("sha256").update(ip + (process.env.IP_HASH_SALT ?? "")).digest("hex");
}
