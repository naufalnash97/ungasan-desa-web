import { schema as s } from "@/db";
import { getDocuments } from "@/lib/data";
import { ok, fail } from "@/lib/http";

export const dynamic = "force-dynamic";
type Cat = (typeof s.documentCategoryEnum.enumValues)[number];

/** GET /api/v1/dokumen?kategori=APBDES&tahun=2025 */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const kategori = u.searchParams.get("kategori")?.toUpperCase();
  if (kategori && !s.documentCategoryEnum.enumValues.includes(kategori as Cat)) return fail(400, "BAD_CATEGORY", "kategori tidak dikenal");
  const tahun = u.searchParams.get("tahun");
  return ok(await getDocuments({ category: kategori as Cat | undefined, year: tahun ? Number(tahun) : undefined }));
}
