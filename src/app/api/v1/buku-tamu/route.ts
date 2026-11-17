import { desc } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { clientIp, hashIp, isAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { ok, fail, zodFail } from "@/lib/http";
import { guestbookInput } from "../schemas";

export const dynamic = "force-dynamic";

/** POST /api/v1/buku-tamu — publik, rate-limit 5/menit/IP, honeypot `website` */
export async function POST(req: Request) {
  const ipHash = hashIp(clientIp(req));
  const rl = rateLimit(`gb:${ipHash}`);
  if (!rl.ok) return fail(429, "RATE_LIMITED", "Terlalu banyak percobaan, coba lagi sebentar.", { retryAfter: rl.retryAfter });
  const parsed = guestbookInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodFail(parsed.error);
  const { website, message, ...rest } = parsed.data;
  // Bot mengisi honeypot → balas sukses palsu tanpa menyimpan (tidak membocorkan deteksi)
  if (website) return ok({ id: 0, createdAt: new Date() }, { status: 201 });
  const [row] = await db.insert(s.guestbookEntries).values({ ...rest, message: message || null, ipHash })
    .returning({ id: s.guestbookEntries.id, createdAt: s.guestbookEntries.createdAt });
  return ok(row, { status: 201 });
}

/** GET /api/v1/buku-tamu (admin) */
export async function GET(req: Request) {
  if (!isAdmin(req)) return fail(401, "UNAUTHORIZED", "Token admin tidak valid");
  const rows = await db.select({
    id: s.guestbookEntries.id, name: s.guestbookEntries.name, origin: s.guestbookEntries.origin,
    purpose: s.guestbookEntries.purpose, message: s.guestbookEntries.message, createdAt: s.guestbookEntries.createdAt,
  }).from(s.guestbookEntries).orderBy(desc(s.guestbookEntries.createdAt)).limit(200);
  return ok(rows);
}
