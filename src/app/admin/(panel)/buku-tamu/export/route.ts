import { desc } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { getCurrentAdmin, audit } from "@/lib/session";

export const dynamic = "force-dynamic";

// Escape CSV + cegah formula injection di Excel (=, +, -, @)
const csv = (v: unknown) => {
  let t = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`;
  return `"${t.replace(/"/g, '""')}"`;
};

export async function GET() {
  const user = await getCurrentAdmin();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const rows = await db.select().from(s.guestbookEntries).orderBy(desc(s.guestbookEntries.createdAt));
  const lines = [["waktu", "nama", "asal", "keperluan", "pesan", "ditinjau"].join(",")]
    .concat(rows.map((r) => [r.createdAt.toISOString(), r.name, r.origin, r.purpose, r.message, r.approved ? "ya" : "tidak"].map(csv).join(",")));
  await audit(user, "EXPORT", "guestbook", null, `Unduh CSV buku tamu (${rows.length} entri)`);
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="buku-tamu-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
