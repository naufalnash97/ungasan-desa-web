"use server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema as s } from "@/db";
import { audit, requireAdmin } from "@/lib/session";
import type { ActionState } from "../../_ui/types";
import { fromZod, isUniqueViolation, str } from "../../_ui/util";

const n = z.coerce.number().int("Harus bilangan bulat").min(0, "Tidak boleh negatif").max(10_000_000);
const schema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  category: z.string().regex(/^[A-Z_]{3,40}$/, "Kategori tidak valid"),
  label: z.string().trim().min(1, "Uraian wajib diisi").max(120),
  male: n, female: n, total: n.optional(), sortOrder: z.coerce.number().int().min(0).max(999),
  asOf: z.coerce.date(),
});

function parse(fd: FormData) {
  const r = schema.safeParse({
    year: str(fd, "year"), category: str(fd, "category"), label: str(fd, "label"),
    male: str(fd, "male") || 0, female: str(fd, "female") || 0, total: str(fd, "total") || undefined,
    sortOrder: str(fd, "sortOrder") || 0, asOf: str(fd, "asOf") || new Date(),
  });
  // Total kosong → dihitung otomatis L + P
  return r.success ? { ...r, data: { ...r.data, total: r.data.total ?? r.data.male + r.data.female } } : r;
}

export async function saveStat(id: number | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = parse(fd);
  if (!parsed.success) return fromZod(parsed.error);
  try {
    if (id) await db.update(s.populationStats).set(parsed.data).where(eq(s.populationStats.id, id));
    else await db.insert(s.populationStats).values(parsed.data);
  } catch (e) {
    if (isUniqueViolation(e)) return { message: "Uraian itu sudah ada untuk tahun & kategori yang sama." };
    throw e;
  }
  await audit(user, id ? "UPDATE" : "CREATE", "population_stat", id, `${parsed.data.category} · ${parsed.data.label} = ${parsed.data.total}`);
  revalidatePath("/", "layout");
  return { ok: true, message: "Tersimpan." };
}

export async function deleteStat(id: number) {
  const user = await requireAdmin();
  const [row] = await db.delete(s.populationStats).where(eq(s.populationStats.id, id)).returning({ label: s.populationStats.label });
  if (row) await audit(user, "DELETE", "population_stat", id, `Hapus statistik: ${row.label}`);
  revalidatePath("/", "layout");
}
