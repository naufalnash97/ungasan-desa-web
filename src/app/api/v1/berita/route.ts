import { db, schema as s } from "@/db";
import { getPosts, type PostCategory } from "@/lib/data";
import { isAdmin } from "@/lib/auth";
import { ok, fail, zodFail } from "@/lib/http";
import { postInput } from "../schemas";

export const dynamic = "force-dynamic";
const CATS = ["BERITA", "PENGUMUMAN", "VIDEO"];

/** GET /api/v1/berita?kategori=PENGUMUMAN&limit=10&offset=0 */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const kategori = u.searchParams.get("kategori")?.toUpperCase();
  if (kategori && !CATS.includes(kategori)) return fail(400, "BAD_CATEGORY", "kategori tidak dikenal");
  const limit = Number(u.searchParams.get("limit") ?? 12);
  const offset = Number(u.searchParams.get("offset") ?? 0);
  const data = await getPosts({ category: kategori as PostCategory | undefined, limit, offset });
  return ok(data, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}

/** POST /api/v1/berita  (admin) */
export async function POST(req: Request) {
  if (!isAdmin(req)) return fail(401, "UNAUTHORIZED", "Token admin tidak valid");
  const parsed = postInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodFail(parsed.error);
  try {
    const [row] = await db.insert(s.posts).values(parsed.data).returning();
    return ok(row, { status: 201 });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "23505") return fail(409, "SLUG_TAKEN", "Slug sudah dipakai");
    throw e;
  }
}
