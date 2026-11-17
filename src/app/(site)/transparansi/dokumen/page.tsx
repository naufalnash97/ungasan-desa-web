import Link from "next/link";
import PageShell from "@/components/PageShell";
import { getDocuments } from "@/lib/data";
import { schema } from "@/db";

export const metadata = { title: "Laporan & Dokumen" };
type Cat = (typeof schema.documentCategoryEnum.enumValues)[number];
const LABEL: Partial<Record<Cat, string>> = { APBDES: "APBDes", INFOGRAFIS: "Infografis", REALISASI: "Realisasi", LPPDES: "LPPDes", LKPPDES: "LKPPDes", LPPD_AMJ: "LPPD AMJ", RPJM: "RPJM", RKP: "RKP", BLT_DD: "BLT DD", PPID: "PPID" };

export default async function Page({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  const k = (await searchParams).kategori?.toUpperCase() as Cat | undefined;
  const cat = k && schema.documentCategoryEnum.enumValues.includes(k) ? k : undefined;
  const docs = await getDocuments({ category: cat });
  return (
    <PageShell crumbs={[{ label: "Transparansi", href: "/transparansi" }, { label: "Laporan & Dokumen" }]} eyebrow="Arsip" title="Laporan & Dokumen"
      summary="Semua dokumen transparansi dalam satu tempat — difilter per kategori, diurutkan per tahun.">
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/transparansi/dokumen" className={`btn-sm btn ${!cat ? "bg-ink text-white" : "border border-line"}`}>Semua</Link>
        {Object.entries(LABEL).map(([key, l]) => (
          <Link key={key} href={`/transparansi/dokumen?kategori=${key}`} aria-current={cat === key ? "page" : undefined}
            className={`btn-sm btn ${cat === key ? "bg-ink text-white" : "border border-line hover:bg-tint"}`}>{l}</Link>
        ))}
      </div>
      <div className="overflow-hidden rounded-kpi border border-line-soft">
        <table className="w-full text-[13.5px]">
          <thead className="bg-card text-[11.5px] uppercase tracking-wide text-muted"><tr>
            <th scope="col" className="py-2.5 pl-4 text-left font-medium">Dokumen</th><th scope="col" className="px-3 text-left font-medium">Kategori</th>
            <th scope="col" className="px-3 text-left font-medium">Tahun</th><th scope="col" className="pr-4"><span className="sr-only">Aksi</span></th>
          </tr></thead>
          <tbody>
            {docs.map((d, i) => (
              <tr key={d.id} className={i % 2 ? "bg-tint/60" : ""}>
                <th scope="row" className="py-3 pl-4 text-left font-normal">{d.title}</th>
                <td className="px-3 text-muted">{LABEL[d.category] ?? d.category}</td><td className="num px-3 text-muted">{d.year ?? "—"}</td>
                <td className="py-2 pr-4 text-right"><a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">Unduh</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
