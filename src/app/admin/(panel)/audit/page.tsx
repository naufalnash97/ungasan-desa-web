import { desc, eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireAdmin } from "@/lib/session";
import PageHeader, { Badge, Table } from "../../_ui/PageHeader";

export const metadata = { title: "Log Audit" };
export default async function Page() {
  await requireAdmin("ADMIN");
  const rows = await db.select({ id: s.auditLogs.id, action: s.auditLogs.action, entity: s.auditLogs.entity, entityId: s.auditLogs.entityId, summary: s.auditLogs.summary, at: s.auditLogs.createdAt, who: s.adminUsers.email })
    .from(s.auditLogs).leftJoin(s.adminUsers, eq(s.adminUsers.id, s.auditLogs.userId)).orderBy(desc(s.auditLogs.createdAt)).limit(300);
  return (
    <>
      <PageHeader title="Log Audit" desc="300 aktivitas terakhir. Log tidak bisa diubah atau dihapus dari panel." />
      <Table head={["Waktu", "Pengguna", "Aksi", "Objek", "Keterangan"]} empty={!rows.length}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="whitespace-nowrap px-4 py-2.5 text-[12.5px] text-muted">{r.at.toLocaleString("id-ID", { timeZone: "Asia/Makassar", dateStyle: "short", timeStyle: "medium" })}</td>
            <td className="px-4 py-2.5 text-[12.5px]">{r.who ?? "—"}</td>
            <td className="px-4 py-2.5"><Badge tone={r.action === "DELETE" ? "orange" : r.action === "CREATE" || r.action === "UPLOAD" ? "green" : "gray"}>{r.action}</Badge></td>
            <td className="px-4 py-2.5 font-mono text-[12px] text-muted">{r.entity}{r.entityId ? `#${r.entityId}` : ""}</td>
            <td className="px-4 py-2.5 text-right text-[13px]">{r.summary}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
