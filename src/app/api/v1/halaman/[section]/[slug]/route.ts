import { getPage, type Section } from "@/lib/data";
import { ok, fail } from "@/lib/http";

export const dynamic = "force-dynamic";
const SECTIONS = ["PROFIL", "PEMERINTAHAN", "TRANSPARANSI", "LAYANAN"];

/** GET /api/v1/halaman/profil/sejarah */
export async function GET(_req: Request, { params }: { params: Promise<{ section: string; slug: string }> }) {
  const { section, slug } = await params;
  const sec = section.toUpperCase();
  if (!SECTIONS.includes(sec)) return fail(404, "NOT_FOUND", "Bagian tidak dikenal");
  const page = await getPage(sec as Section, slug);
  return page ? ok(page) : fail(404, "NOT_FOUND", "Halaman tidak ditemukan");
}
