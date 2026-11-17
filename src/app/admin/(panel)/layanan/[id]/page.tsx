import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireAdmin } from "@/lib/session";
import PageHeader from "../../../_ui/PageHeader";
import ConfirmButton from "../../../_ui/ConfirmButton";
import ServiceForm from "../ServiceForm";
import { deleteService } from "../actions";

export const metadata = { title: "Ubah layanan" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [svc] = await db.select().from(s.services).where(eq(s.services.id, id)).limit(1);
  if (!svc) notFound();
  return (
    <>
      <PageHeader title={svc.name} back={{ href: "/admin/layanan", label: "Layanan" }} />
      <ServiceForm svc={svc} />
      <form action={deleteService.bind(null, id)} className="mt-10 border-t border-line pt-6"><ConfirmButton label="Hapus layanan ini" message={`Hapus layanan "${svc.name}"?`} /></form>
    </>
  );
}
