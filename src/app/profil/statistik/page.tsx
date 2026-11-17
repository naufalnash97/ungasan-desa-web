import PageShell from "@/components/PageShell";
import StatsSection from "@/components/StatsSection";
import { getPopulation } from "@/lib/data";
import { ribu } from "@/lib/format";

export const metadata = { title: "Desa dalam Angka" };

export default async function Page() {
  const pop = await getPopulation();
  return (
    <PageShell crumbs={[{ label: "Profil", href: "/profil" }, { label: "Desa dalam Angka" }]} eyebrow="Data desa" title="Desa dalam Angka"
      summary="Statistik kependudukan Desa Ungasan. Kategori pendidikan, pekerjaan, umur, dan disabilitas ditambahkan operator melalui tabel population_stats.">
      {pop ? (
        <>
          <StatsSection pop={pop} />
          <div id="kategori" className="mt-12 overflow-hidden rounded-kpi border border-line-soft">
            <table className="w-full text-[13.5px]">
              <caption className="border-b border-line-soft bg-card px-4 py-3 text-left text-sm font-semibold">Semua kategori ({pop.year})</caption>
              <thead className="text-[11.5px] uppercase tracking-wide text-muted">
                <tr className="border-b border-line-soft">
                  <th scope="col" className="py-2 pl-4 text-left font-medium">Kategori</th><th scope="col" className="px-3 text-left font-medium">Uraian</th>
                  <th scope="col" className="px-3 text-right font-medium">L</th><th scope="col" className="px-3 text-right font-medium">P</th><th scope="col" className="pr-4 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {pop.rows.map((r, i) => (
                  <tr key={r.id} className={i % 2 ? "bg-tint/60" : ""}>
                    <td className="py-3 pl-4 text-muted">{r.category.replace("_", " ").toLowerCase()}</td>
                    <th scope="row" className="px-3 text-left font-normal">{r.label}</th>
                    <td className="num px-3 text-right">{ribu(r.male)}</td><td className="num px-3 text-right">{ribu(r.female)}</td>
                    <td className="num pr-4 text-right font-medium">{ribu(r.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : <p className="text-muted">Statistik belum dipublikasikan.</p>}
    </PageShell>
  );
}
