import { getServices } from "@/lib/data";
import { ok } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  return ok(await getServices(), { headers: { "Cache-Control": "public, s-maxage=300" } });
}
