import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { getPost } from "@/lib/data";
import { isAdmin } from "@/lib/auth";
import { ok, fail, zodFail } from "@/lib/http";
import { postInput } from "../../schemas";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const post = await getPost((await params).slug);
  return post ? ok(post) : fail(404, "NOT_FOUND", "Berita tidak ditemukan");
}

export async function PUT(req: Request, { params }: Ctx) {
  if (!isAdmin(req)) return fail(401, "UNAUTHORIZED", "Token admin tidak valid");
  const parsed = postInput.partial().safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodFail(parsed.error);
  const [row] = await db.update(s.posts).set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(s.posts.slug, (await params).slug)).returning();
  return row ? ok(row) : fail(404, "NOT_FOUND", "Berita tidak ditemukan");
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!isAdmin(req)) return fail(401, "UNAUTHORIZED", "Token admin tidak valid");
  const [row] = await db.delete(s.posts).where(eq(s.posts.slug, (await params).slug)).returning({ slug: s.posts.slug });
  return row ? new Response(null, { status: 204 }) : fail(404, "NOT_FOUND", "Berita tidak ditemukan");
}
