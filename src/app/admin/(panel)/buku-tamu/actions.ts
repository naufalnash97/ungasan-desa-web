"use server";
import { revalidatePath } from "next/cache";
import { eq, not } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { audit, requireAdmin } from "@/lib/session";

export async function toggleGuest(id: number) {
  const user = await requireAdmin();
  await db.update(s.guestbookEntries).set({ approved: not(s.guestbookEntries.approved) }).where(eq(s.guestbookEntries.id, id));
  await audit(user, "UPDATE", "guestbook", id, "Ubah status tinjau buku tamu");
  revalidatePath("/admin/buku-tamu");
}

export async function deleteGuest(id: number) {
  const user = await requireAdmin();
  const [row] = await db.delete(s.guestbookEntries).where(eq(s.guestbookEntries.id, id)).returning({ name: s.guestbookEntries.name });
  if (row) await audit(user, "DELETE", "guestbook", id, `Hapus entri buku tamu: ${row.name}`);
  revalidatePath("/admin/buku-tamu");
}
