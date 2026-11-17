import { persen, rupiah, rupiahRingkas, angka, tanggal } from "@/lib/format";
import type { getBudget } from "@/lib/data";
import Progress from "./Progress";

type Budget = NonNullable<Awaited<ReturnType<typeof getBudget>>>;
type Line = Budget["pendapatan"]["items"][number];

const GROUPS = [
  { key: "pendapatan", label: "Pendapatan", color: "var(--color-c-blue)" },
  { key: "belanja", label: "Belanja", color: "var(--color-c-orange)" },
  { key: "pembiayaan", label: "Pembiayaan", color: "var(--color-c-green)" },
] as const;

export const VERSION_LABEL = { MURNI: "Murni", PERUBAHAN: "Perubahan", PERUBAHAN_KEDUA: "Perubahan Kedua" } as const;

/** 3 kartu KPI realisasi vs anggaran — pola Basedash */
export function ApbdesKpis({ budget }: { budget: Budget }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {GROUPS.map(({ key, label, color }) => {
        const t = budget[key].total;
        if (!t) return null;
        const p = persen(t.realized, t.planned);
        return (
          <div key={key} className="card-kpi p-5">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-[13px] text-muted"><i aria-hidden className="size-2 rounded-full" style={{ background: color }} /> {label} desa</p>
              <span className="num rounded-full bg-white px-2 py-0.5 text-[12px] font-medium ring-1 ring-line">{angka(p, 1)}%</span>
            </div>
            <p className="num mt-4 text-[2rem] font-semibold leading-none tracking-[-0.02em]" title={rupiah(t.realized)}>{rupiahRingkas(t.realized)}</p>
            <p className="num mt-1.5 text-[13px] text-muted">realisasi dari {rupiahRingkas(t.planned)}</p>
            <div className="mt-5"><Progress value={p} color={color} label={`Realisasi ${label.toLowerCase()} ${angka(p, 1)} persen`} /></div>
          </div>
        );
      })}
    </div>
  );
}

function Rows({ items, color }: { items: Line[]; color: string }) {
  return items.map((l, i) => {
    const p = persen(l.realized, l.planned);
    return (
      <tr key={l.id} className={i % 2 ? "bg-tint/60" : ""}>
        <th scope="row" className="py-3 pl-4 pr-3 text-left font-normal text-ink-2">{l.name}</th>
        <td className="num hidden px-3 py-3 text-right text-muted md:table-cell">{rupiah(l.planned)}</td>
        <td className="num px-3 py-3 text-right">{rupiah(l.realized)}</td>
        <td className="w-[28%] py-3 pl-3 pr-4">
          <div className="flex items-center gap-3">
            <Progress value={p} color={p > 100 ? "var(--color-c-pink)" : color} label={`${l.name} ${angka(p, 0)} persen`} />
            <span className="num w-12 shrink-0 text-right text-[12.5px] font-medium">{angka(p, 0)}%</span>
          </div>
          {p > 100 && <span className="mt-1 inline-block rounded bg-c-pink/15 px-1.5 text-[10.5px] font-medium text-[#a3236a]">melebihi target</span>}
        </td>
      </tr>
    );
  });
}

/** Tabel rincian — baris abu selang-seling ala Papermark */
export function ApbdesTable({ budget, groups = ["pendapatan", "belanja"] }: { budget: Budget; groups?: ("pendapatan" | "belanja" | "pembiayaan")[] }) {
  return (
    <div className="space-y-6">
      {GROUPS.filter((g) => groups.includes(g.key)).map(({ key, label, color }) => (
        budget[key].items.length > 0 && (
          <div key={key} className="overflow-hidden rounded-kpi border border-line-soft">
            <table className="w-full text-[13.5px]">
              <caption className="border-b border-line-soft bg-card px-4 py-3 text-left text-sm font-semibold">Rincian {label.toLowerCase()} {budget.year}</caption>
              <thead className="text-[11.5px] uppercase tracking-wide text-muted">
                <tr className="border-b border-line-soft">
                  <th scope="col" className="py-2 pl-4 pr-3 text-left font-medium">Uraian</th>
                  <th scope="col" className="hidden px-3 py-2 text-right font-medium md:table-cell">Anggaran</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Realisasi</th>
                  <th scope="col" className="py-2 pl-3 pr-4 text-left font-medium">Capaian</th>
                </tr>
              </thead>
              <tbody><Rows items={budget[key].items} color={color} /></tbody>
            </table>
          </div>
        )
      ))}
      <p className="text-[12px] text-muted">APBDes {budget.year} ({VERSION_LABEL[budget.version]}) · posisi {tanggal(budget.asOf)}</p>
    </div>
  );
}
