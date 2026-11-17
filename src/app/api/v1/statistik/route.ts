import { getPopulation } from "@/lib/data";
import { ok, fail } from "@/lib/http";

export const dynamic = "force-dynamic";

/** GET /api/v1/statistik?tahun=2026 */
export async function GET(req: Request) {
  const tahun = new URL(req.url).searchParams.get("tahun");
  const data = await getPopulation(tahun ? Number(tahun) : undefined);
  return data ? ok(data) : fail(404, "NOT_FOUND", "Statistik belum tersedia");
}
