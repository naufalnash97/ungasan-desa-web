import Link from "next/link";
import PageShell from "@/components/PageShell";
import { ApbdesKpis, ApbdesTable } from "@/components/ApbdesPanel";
import { getBudget, getBudgetIndex, getDocuments, type BudgetVersion } from "@/lib/data";
import ApbdesFilter from "./ApbdesFilter";

export const metadata = { title: "APBDes" };
const VERSIONS = ["MURNI", "PERUBAHAN", "PERUBAHAN_KEDUA"];

export default async function Page({ searchParams }: { searchParams: Promise<{ tahun?: string; versi?: string }> }) {
  const sp = await searchParams;
  const versi = (VERSIONS.includes(sp.versi?.toUpperCase() ?? "") ? sp.versi!.toUpperCase() : "MURNI") as BudgetVersion;
  const tahun = sp.tahun && /^\d{4}$/.test(sp.tahun) ? Number(sp.tahun) : undefined;
  const [budget, available] = await Promise.all([getBudget(tahun, versi), getBudgetIndex()]);
  const docs = await getDocuments({ category: "APBDES", year: budget?.year ?? tahun });
  return (
    <PageShell crumbs={[{ label: "Transparansi", href: "/transparansi" }, { label: "APBDes" }]} eyebrow="Keuangan desa"
      title={`APBDes ${budget?.year ?? tahun ?? ""}`} summary="Anggaran Pendapatan dan Belanja Desa: anggaran, realisasi, dan capaian per bidang.">
      {available.length > 0 && <ApbdesFilter available={available} year={budget?.year ?? tahun ?? available[0].year} version={versi} />}
      {budget ? (
        <>
          <ApbdesKpis budget={budget} />
          <div className="mt-8"><ApbdesTable budget={budget} /></div>
        </>
      ) : (
        <div className="rounded-kpi border border-dashed border-line p-8 text-center text-muted">
          Data rincian APBDes {tahun} ({versi.toLowerCase().replace("_", " ")}) belum dipublikasikan. Silakan unduh dokumen di bawah.
        </div>
      )}
      <h2 className="mt-14 text-xl font-semibold">Dokumen terkait</h2>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {docs.map((d) => (
          <li key={d.id} className="flex items-center justify-between py-3 text-sm">
            <span>{d.title}</span><a href={d.fileUrl} className="btn-secondary btn-sm" target="_blank" rel="noopener noreferrer">Unduh</a>
          </li>
        ))}
        {!docs.length && <li className="py-3 text-sm text-muted">Belum ada dokumen. <Link className="underline" href="/transparansi/dokumen">Lihat semua dokumen</Link></li>}
      </ul>
    </PageShell>
  );
}
