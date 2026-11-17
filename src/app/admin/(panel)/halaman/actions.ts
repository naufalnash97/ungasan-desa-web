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
  section: z.enum(["PROFIL", "PEMERINTAHAN", "TRANSPARANSI", "LAYANAN"]),
  title: z.string().min(2, "Judul wajib diisi").max(200),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Hanya huruf kecil, angka, dan tanda hubung").max(100),
  summary: z.string().max(300).optional(),
  body: z.string().max(100_000),
  externalUrl: httpsUrl.optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  published: z.boolean(),
});

export async function savePage(id: number | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const title = str(fd, "title");
  const parsed = schema.safeParse({
    section: str(fd, "section"), title, slug: str(fd, "slug") || slugify(title), summary: optional(str(fd, "summary")),
    body: str(fd, "body"), externalUrl: optional(str(fd, "externalUrl")), sortOrder: str(fd, "sortOrder") || 0, published: checkbox(fd, "published"),
  });
  if (!parsed.success) return fromZod(parsed.error);
  const data = { ...parsed.data, summary: parsed.data.summary ?? null, externalUrl: parsed.data.externalUrl ?? null };
  try {
    if (id) {
      await db.update(s.pages).set({ ...data, updatedAt: new Date() }).where(eq(s.pages.id, id));
      await audit(user, "UPDATE", "page", id, `Ubah halaman: ${data.title}`);
    } else {
      const [row] = await db.insert(s.pages).values(data).returning({ id: s.pages.id });
      await audit(user, "CREATE", "page", row.id, `Tambah halaman: ${data.title}`);
    }
  } catch (e) {
    if (isUniqueViolation(e)) return { message: "Slug sudah dipakai di bagian ini.", fieldErrors: { slug: ["Slug sudah dipakai di bagian ini"] } };
    throw e;
  }
  revalidatePath("/", "layout");
  redirect("/admin/halaman?saved=1");
}

export async function deletePage(id: number) {
  const user = await requireAdmin();
  const [row] = await db.delete(s.pages).where(eq(s.pages.id, id)).returning({ title: s.pages.title });
  if (row) await audit(user, "DELETE", "page", id, `Hapus halaman: ${row.title}`);
  revalidatePath("/", "layout");
  redirect("/admin/halaman");
}
