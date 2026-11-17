import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireAdmin } from "@/lib/session";
import PageHeader from "../../../_ui/PageHeader";
import ConfirmButton from "../../../_ui/ConfirmButton";
import PageForm from "../PageForm";
import { deletePage } from "../actions";

export const metadata = { title: "Ubah halaman" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [page] = await db.select().from(s.pages).where(eq(s.pages.id, id)).limit(1);
  if (!page) notFound();
  return (
    <>
      <PageHeader title="Ubah halaman" desc={page.title} back={{ href: "/admin/halaman", label: "Halaman" }} />
      <PageForm page={page} />
      <form action={deletePage.bind(null, page.id)} className="mt-10 border-t border-line pt-6">
        <ConfirmButton label="Hapus halaman ini" message={`Hapus halaman "${page.title}"?`} />
      </form>
    </>
  );
}
