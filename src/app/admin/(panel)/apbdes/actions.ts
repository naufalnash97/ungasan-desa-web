"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, asc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema as s } from "@/db";
import { audit, requireAdmin } from "@/lib/session";
import type { ActionState } from "../../_ui/types";
import { checkbox, fromZod, isUniqueViolation, str, violatedConstraint } from "../../_ui/util";

const MAX_RP = 9_000_000_000_000_000; // < 2^53, aman untuk BIGINT mode number
const line = z.object({
  group: z.enum(["PENDAPATAN", "BELANJA", "PEMBIAYAAN"]),
  name: z.string().trim().min(1, "Uraian wajib diisi").max(200),
  isTotal: z.boolean(),
  planned: z.number().int().nonnegative().max(MAX_RP),
  realized: z.number().int().nonnegative().max(MAX_RP),
});
const header = z.object({
  year: z.coerce.number().int().min(2000, "Tahun tidak valid").max(2100, "Tahun tidak valid"),
  version: z.enum(["MURNI", "PERUBAHAN", "PERUBAHAN_KEDUA"]),
  asOf: z.coerce.date({ message: "Tanggal tidak valid" }),
  isCurrent: z.boolean(),
});

/** Buat APBDes baru; bila `copyFrom` diisi, rincian disalin (berguna untuk APBDes Perubahan). */
export async function createBudget(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = header.safeParse({ year: str(fd, "year"), version: str(fd, "version"), asOf: str(fd, "asOf") || new Date(), isCurrent: false });
  if (!parsed.success) return fromZod(parsed.error);
  const copyFrom = Number(str(fd, "copyFrom")) || null;
  let id: number;
  try {
    id = await db.transaction(async (tx) => {
      const [b] = await tx.insert(s.budgets).values(parsed.data).returning({ id: s.budgets.id });
      if (copyFrom) {
        const lines = await tx.select().from(s.budgetLines).where(eq(s.budgetLines.budgetId, copyFrom)).orderBy(asc(s.budgetLines.sortOrder));
        if (lines.length) await tx.insert(s.budgetLines).values(lines.map(({ id: _id, budgetId: _b, ...l }) => ({ ...l, budgetId: b.id, realized: 0 })));
      }
      return b.id;
    });
  } catch (e) {
    if (isUniqueViolation(e)) return { message: "APBDes untuk tahun & versi itu sudah ada.", fieldErrors: { version: ["Sudah ada"] } };
    throw e;
  }
  await audit(user, "CREATE", "budget", id, `Buat APBDes ${parsed.data.year} ${parsed.data.version}`);
  redirect(`/admin/apbdes/${id}`);
}

export async function saveBudget(id: number, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const h = header.safeParse({ year: str(fd, "year"), version: str(fd, "version"), asOf: str(fd, "asOf"), isCurrent: checkbox(fd, "isCurrent") });
  if (!h.success) return fromZod(h.error);
  let raw: unknown;
  try { raw = JSON.parse(str(fd, "lines") || "[]"); } catch { return { message: "Data rincian rusak, muat ulang halaman." }; }
  const lines = z.array(line).max(300).safeParse(raw);
  if (!lines.success) {
    const first = lines.error.issues[0];
    return { message: `Rincian baris ${Number(first.path[0]) + 1}: ${first.message}` };
  }
  for (const g of ["PENDAPATAN", "BELANJA", "PEMBIAYAAN"] as const) {
    if (lines.data.filter((l) => l.group === g && l.isTotal).length > 1) return { message: `Kelompok ${g.toLowerCase()} hanya boleh punya satu baris total.` };
  }
  try {
    const found = await db.transaction(async (tx) => {
      // Kunci transaksi: dua penyimpanan bersamaan diproses berurutan (hindari balapan is_current)
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext('budgets_current'))`);
      const [exists] = await tx.select({ id: s.budgets.id }).from(s.budgets).where(eq(s.budgets.id, id)).for("update");
      if (!exists) return false;
      if (h.data.isCurrent) await tx.update(s.budgets).set({ isCurrent: false }).where(eq(s.budgets.isCurrent, true));
      await tx.update(s.budgets).set({ ...h.data, updatedAt: new Date() }).where(eq(s.budgets.id, id));
      await tx.delete(s.budgetLines).where(eq(s.budgetLines.budgetId, id));
      if (lines.data.length) await tx.insert(s.budgetLines).values(lines.data.map((l, i) => ({ ...l, budgetId: id, sortOrder: i })));
      return true;
    });
    if (!found) return { message: "APBDes ini sudah dihapus. Muat ulang daftar APBDes." };
  } catch (e) {
    if (isUniqueViolation(e)) {
      return violatedConstraint(e) === "budgets_one_current_uq"
        ? { message: "Versi beranda baru saja diubah pengguna lain. Muat ulang lalu simpan lagi." }
        : { message: "Sudah ada APBDes lain dengan tahun & versi yang sama.", fieldErrors: { version: ["Sudah ada"] } };
    }
    throw e;
  }
  await audit(user, "UPDATE", "budget", id, `Ubah APBDes ${h.data.year} ${h.data.version} (${lines.data.length} baris)`);
  revalidatePath("/", "layout");
  return { ok: true, message: `Tersimpan — ${lines.data.length} baris rincian.${h.data.isCurrent ? " Versi ini sekarang tampil di beranda." : ""}` };
}

export async function deleteBudget(id: number) {
  const user = await requireAdmin();
  const [row] = await db.delete(s.budgets).where(and(eq(s.budgets.id, id))).returning({ year: s.budgets.year, version: s.budgets.version });
  if (row) await audit(user, "DELETE", "budget", id, `Hapus APBDes ${row.year} ${row.version}`);
  revalidatePath("/", "layout");
  redirect("/admin/apbdes");
}
