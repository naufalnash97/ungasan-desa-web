"use client";
import { useRouter } from "next/navigation";

type Opt = { year: number; version: "MURNI" | "PERUBAHAN" | "PERUBAHAN_KEDUA" };
const LABEL = { MURNI: "Murni", PERUBAHAN: "Perubahan", PERUBAHAN_KEDUA: "Perubahan Kedua" };

/** Level 3–4 menu lama (tahun & versi) menjadi filter — docs/03-AFD.md §2 */
export default function ApbdesFilter({ available, year, version }: { available: Opt[]; year: number; version: Opt["version"] }) {
  const router = useRouter();
  const years = [...new Set(available.map((a) => a.year))];
  const versions = available.filter((a) => a.year === year).map((a) => a.version);
  const go = (y: number, v: string) => router.push(`/transparansi/apbdes?tahun=${y}&versi=${v}`);
  return (
    <form className="mb-8 flex flex-wrap gap-3" action="/transparansi/apbdes">
      <label className="text-[13px] text-muted">Tahun
        <select name="tahun" defaultValue={year} onChange={(e) => go(Number(e.target.value), "MURNI")}
          className="ml-2 h-9 rounded-btn border border-line bg-white px-2 text-sm text-ink">
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </label>
      <label className="text-[13px] text-muted">Versi
        <select name="versi" defaultValue={version} onChange={(e) => go(year, e.target.value)}
          className="ml-2 h-9 rounded-btn border border-line bg-white px-2 text-sm text-ink">
          {versions.map((v) => <option key={v} value={v}>{LABEL[v]}</option>)}
        </select>
      </label>
      <noscript><button className="btn-secondary btn-sm">Terapkan</button></noscript>
    </form>
  );
}
