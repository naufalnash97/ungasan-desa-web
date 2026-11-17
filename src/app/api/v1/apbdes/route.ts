import { and, eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { getBudget, getBudgetIndex, type BudgetVersion } from "@/lib/data";
import { isAdmin } from "@/lib/auth";
import { ok, fail, zodFail } from "@/lib/http";
import { budgetInput } from "../schemas";

export const dynamic = "force-dynamic";
const VERSIONS = ["MURNI", "PERUBAHAN", "PERUBAHAN_KEDUA"];

/** GET /api/v1/apbdes?tahun=2026&versi=MURNI — tanpa parameter = versi aktif */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const tahun = u.searchParams.get("tahun");
  const versi = (u.searchParams.get("versi") ?? "MURNI").toUpperCase();
  if (!VERSIONS.includes(versi)) return fail(400, "BAD_VERSION", "versi harus MURNI | PERUBAHAN | PERUBAHAN_KEDUA");
  const [budget, available] = await Promise.all([
    getBudget(tahun ? Number(tahun) : undefined, versi as BudgetVersion),
    getBudgetIndex(),
  ]);
  if (!budget) return fail(404, "NOT_FOUND", "APBDes belum dipublikasikan", { available });
  return ok({ ...budget, available });
}

/** PUT /api/v1/apbdes (admin) — upsert satu APBDes lengkap (tahun+versi) beserta rinciannya, atomik */
export async function PUT(req: Request) {
  if (!isAdmin(req)) return fail(401, "UNAUTHORIZED", "Token admin tidak valid");
  const parsed = budgetInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodFail(parsed.error);
  const { lines, ...b } = parsed.data;
  const result = await db.transaction(async (tx) => {
    if (b.isCurrent) await tx.update(s.budgets).set({ isCurrent: false });
    await tx.delete(s.budgets).where(and(eq(s.budgets.year, b.year), eq(s.budgets.version, b.version)));
    const [row] = await tx.insert(s.budgets).values(b).returning();
    await tx.insert(s.budgetLines).values(lines.map((l, i) => ({ ...l, budgetId: row.id, sortOrder: i })));
    return row;
  });
  return ok(result);
}
