"use server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema as s } from "@/db";
import { audit, requireAdmin } from "@/lib/session";
import { removeUpload, saveUpload, UploadError } from "@/lib/uploads";
import type { ActionState } from "../../_ui/types";
import { fromZod, httpsUrl, optional, str } from "../../_ui/util";

const schema = z.object({
  category: z.enum(s.documentCategoryEnum.enumValues),
  title: z.string().min(3, "Judul minimal 3 karakter").max(200),
  year: z.coerce.number().int().min(1990).max(2100).optional(),
  description: z.string().max(500).optional(),
  fileUrl: httpsUrl.optional(),
});

export async function createDocument(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = schema.safeParse({
    category: str(fd, "category"), title: str(fd, "title"), year: optional(str(fd, "year")),
    description: optional(str(fd, "description")), fileUrl: optional(str(fd, "fileUrl")),
  });
  if (!parsed.success) return fromZod(parsed.error);
  const file = fd.get("file");
  let fileUrl = parsed.data.fileUrl;
  if (file instanceof File && file.size > 0) {
    try { fileUrl = (await saveUpload(file)).url; }
    catch (e) { if (e instanceof UploadError) return { message: e.message, fieldErrors: { file: [e.message] } }; throw e; }
  }
  if (!fileUrl) return { message: "Unggah file atau isi URL dokumen.", fieldErrors: { file: ["Wajib salah satu: file atau URL"] } };
  const [row] = await db.insert(s.documents).values({ ...parsed.data, fileUrl }).returning({ id: s.documents.id });
  await audit(user, fileUrl.startsWith("/uploads/") ? "UPLOAD" : "CREATE", "document", row.id, `Dokumen: ${parsed.data.title}`);
  revalidatePath("/", "layout");
  return { ok: true, message: `“${parsed.data.title}” tersimpan.` };
}

export async function deleteDocument(id: number) {
  const user = await requireAdmin();
  const [row] = await db.delete(s.documents).where(eq(s.documents.id, id)).returning({ title: s.documents.title, fileUrl: s.documents.fileUrl });
  if (row) {
    await removeUpload(row.fileUrl);
    await audit(user, "DELETE", "document", id, `Hapus dokumen: ${row.title}`);
  }
  revalidatePath("/", "layout");
}
