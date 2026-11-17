"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema as s } from "@/db";
import { audit, requireAdmin } from "@/lib/session";
import type { ActionState } from "../../_ui/types";
import { checkbox, fromZod, isUniqueViolation, slugify, str } from "../../_ui/util";
import { ICONS } from "./icons";

const schema = z.object({
  name: z.string().min(2, "Nama wajib diisi").max(80),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Hanya huruf kecil, angka, tanda hubung").max(60),
  tagline: z.string().min(2, "Tagline wajib diisi").max(80),
  description: z.string().min(5, "Deskripsi minimal 5 karakter").max(240),
  url: z.string().refine((v) => /^https:\/\//.test(v) || /^\/[a-z0-9/_-]*$/i.test(v), "Gunakan URL https:// atau path internal /…"),
  icon: z.enum(ICONS),
  status: z.enum(["ONLINE", "INFO"]),
  bentoSpan: z.enum(["xl", "lg", "md", "sm"]),
  sortOrder: z.coerce.number().int().min(0).max(999),
  active: z.boolean(),
});

export async function saveService(id: number | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const name = str(fd, "name");
  const parsed = schema.safeParse({
    name, slug: str(fd, "slug") || slugify(name), tagline: str(fd, "tagline"), description: str(fd, "description"), url: str(fd, "url"),
    icon: str(fd, "icon"), status: str(fd, "status"), bentoSpan: str(fd, "bentoSpan"), sortOrder: str(fd, "sortOrder") || 0, active: checkbox(fd, "active"),
  });
  if (!parsed.success) return fromZod(parsed.error);
  try {
    if (id) await db.update(s.services).set(parsed.data).where(eq(s.services.id, id));
    else id = (await db.insert(s.services).values(parsed.data).returning({ id: s.services.id }))[0].id;
  } catch (e) {
    if (isUniqueViolation(e)) return { message: "Slug sudah dipakai.", fieldErrors: { slug: ["Slug sudah dipakai"] } };
    throw e;
  }
  await audit(user, "UPDATE", "service", id, `Layanan: ${parsed.data.name}`);
  revalidatePath("/", "layout");
  redirect("/admin/layanan?saved=1");
}

export async function deleteService(id: number) {
  const user = await requireAdmin();
  const [row] = await db.delete(s.services).where(eq(s.services.id, id)).returning({ name: s.services.name });
  if (row) await audit(user, "DELETE", "service", id, `Hapus layanan: ${row.name}`);
  revalidatePath("/", "layout");
  redirect("/admin/layanan");
}
