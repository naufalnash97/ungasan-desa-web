import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireAdmin } from "@/lib/session";
import PageHeader from "../../../_ui/PageHeader";
import AdminForm from "../../../_ui/AdminForm";
import ConfirmButton from "../../../_ui/ConfirmButton";
import { Checkbox, SelectField, SubmitButton, TextField } from "../../../_ui/fields";
import BudgetLinesEditor from "../BudgetLinesEditor";
import { deleteBudget, saveBudget } from "../actions";

export const metadata = { title: "Ubah APBDes" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const budget = await db.query.budgets.findFirst({ where: eq(s.budgets.id, id), with: { lines: { orderBy: [asc(s.budgetLines.sortOrder)] } } });
  if (!budget) notFound();
  return (
    <>
      <PageHeader title={`APBDes ${budget.year}`} desc="Angka dalam rupiah penuh, tanpa desimal." back={{ href: "/admin/apbdes", label: "APBDes" }} />
      <AdminForm action={saveBudget.bind(null, id)}>
        <div className="grid items-end gap-4 rounded-kpi border border-line-soft bg-white p-5 sm:grid-cols-4">
          <TextField name="year" label="Tahun" type="number" defaultValue={budget.year} />
          <SelectField name="version" label="Versi" defaultValue={budget.version} options={[{ value: "MURNI", label: "Murni" }, { value: "PERUBAHAN", label: "Perubahan" }, { value: "PERUBAHAN_KEDUA", label: "Perubahan Kedua" }]} />
          <TextField name="asOf" label="Posisi data per" type="date" defaultValue={budget.asOf.toISOString().slice(0, 10)} />
          <div className="pb-2"><Checkbox name="isCurrent" label="Tampilkan di beranda" defaultChecked={budget.isCurrent} /></div>
        </div>
        <BudgetLinesEditor initial={budget.lines.map(({ group, name, isTotal, planned, realized }) => ({ group, name, isTotal, planned, realized }))} />
        <div className="sticky bottom-0 z-10 -mx-5 flex items-center justify-between gap-3 border-t border-line bg-white/95 px-5 py-3 backdrop-blur md:-mx-10 md:px-10">
          <p className="text-[12.5px] text-muted">Perubahan belum tersimpan sampai Anda menekan Simpan.</p>
          <SubmitButton>Simpan APBDes</SubmitButton>
        </div>
      </AdminForm>
      <form action={deleteBudget.bind(null, id)} className="mt-10 border-t border-line pt-6">
        <ConfirmButton label="Hapus APBDes ini" message={`Hapus APBDes ${budget.year} beserta seluruh rinciannya?`} />
      </form>
    </>
  );
}
