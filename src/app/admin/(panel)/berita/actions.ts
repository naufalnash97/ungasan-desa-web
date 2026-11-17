"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema as s } from "@/db";
import { audit, requireAdmin } from "@/lib/session";
import type { ActionState } from "../../_ui/types";
import { checkbox, fromZod, httpsUrl, isUniqueViolation, optional, slugify, str } from "../../_ui/util";

const schema = z.object({
  category: z.enum(["BERITA", "PENGUMUMAN", "VIDEO"]),
  title: z.string().min(3, "Judul minimal 3 karakter").max(200),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Hanya huruf kecil, angka, dan tanda hubung").max(120),
  excerpt: z.string().max(300).optional(),
  body: z.string().min(1, "Isi wajib diisi").max(50_000),
  coverUrl: httpsUrl.optional(),
  videoUrl: httpsUrl.optional(),
  publishedAt: z.coerce.date({ message: "Tanggal tidak valid" }),
  published: z.boolean(),
});

function parse(fd: FormData) {
  const title = str(fd, "title");
  return schema.safeParse({
    category: str(fd, "category"), title, slug: str(fd, "slug") || slugify(title),
    excerpt: optional(str(fd, "excerpt")), body: str(fd, "body"),
    coverUrl: optional(str(fd, "coverUrl")), videoUrl: optional(str(fd, "videoUrl")),
    publishedAt: str(fd, "publishedAt") || new Date(), published: checkbox(fd, "published"),
  });
}

export async function savePost(id: number | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = parse(fd);
  if (!parsed.success) return fromZod(parsed.error);
  // undefined dilewati oleh .set() Drizzle → field yang dikosongkan editor harus jadi null
  const data = { ...parsed.data, excerpt: parsed.data.excerpt ?? null, coverUrl: parsed.data.coverUrl ?? null, videoUrl: parsed.data.videoUrl ?? null };
  try {
    if (id) {
      await db.update(s.posts).set({ ...data, updatedAt: new Date() }).where(eq(s.posts.id, id));
      await audit(user, "UPDATE", "post", id, `Ubah: ${parsed.data.title}`);
    } else {
      const [row] = await db.insert(s.posts).values(data).returning({ id: s.posts.id });
      id = row.id;
      await audit(user, "CREATE", "post", id, `Tambah ${parsed.data.category.toLowerCase()}: ${parsed.data.title}`);
    }
  } catch (e) {
    if (isUniqueViolation(e)) return { message: "Slug sudah dipakai.", fieldErrors: { slug: ["Slug sudah dipakai berita lain"] } };
    throw e;
  }
  revalidatePath("/", "layout");
  redirect(`/admin/berita?saved=${id}`);
}

export async function deletePost(id: number) {
  const user = await requireAdmin();
  const [row] = await db.delete(s.posts).where(eq(s.posts.id, id)).returning({ title: s.posts.title });
  if (row) await audit(user, "DELETE", "post", id, `Hapus: ${row.title}`);
  revalidatePath("/", "layout");
  redirect("/admin/berita");
}
