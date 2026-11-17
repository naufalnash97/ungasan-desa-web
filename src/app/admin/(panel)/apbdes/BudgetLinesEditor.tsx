"use client";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

type Group = "PENDAPATAN" | "BELANJA" | "PEMBIAYAAN";
export type Line = { group: Group; name: string; isTotal: boolean; planned: number; realized: number };
const GROUPS: { key: Group; label: string }[] = [
  { key: "PENDAPATAN", label: "Pendapatan" }, { key: "BELANJA", label: "Belanja" }, { key: "PEMBIAYAAN", label: "Pembiayaan" },
];
const fmt = new Intl.NumberFormat("id-ID");
const parseRp = (v: string) => Number(v.replace(/[^\d]/g, "")) || 0;

/** Editor rincian APBDes. Nilai dikirim sebagai JSON di input tersembunyi `lines`. */
export default function BudgetLinesEditor({ initial }: { initial: Line[] }) {
  const [lines, setLines] = useState<(Line & { key: number })[]>(() => initial.map((l, i) => ({ ...l, key: i })));
  const [nextKey, setNextKey] = useState(initial.length);

  const update = (key: number, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const remove = (key: number) => setLines((ls) => ls.filter((l) => l.key !== key));
  const move = (key: number, dir: -1 | 1) => setLines((ls) => {
    const i = ls.findIndex((l) => l.key === key); const j = i + dir;
    if (j < 0 || j >= ls.length) return ls;
    const copy = [...ls]; [copy[i], copy[j]] = [copy[j], copy[i]]; return copy;
  });
  const add = (group: Group, isTotal = false) => {
    setLines((ls) => [...ls, { key: nextKey, group, isTotal, name: isTotal ? `${GROUPS.find((g) => g.key === group)!.label} Desa` : "", planned: 0, realized: 0 }]);
    setNextKey((k) => k + 1);
  };

  const payload = useMemo(() => JSON.stringify(lines.map(({ key: _k, ...l }) => l)), [lines]);
  const cell = "w-full rounded border border-line bg-white px-2 py-1.5 text-[13px] outline-none focus:border-ink";

  return (
    <div className="space-y-6">
      <input type="hidden" name="lines" value={payload} />
      {GROUPS.map(({ key: g, label }) => {
        const rows = lines.filter((l) => l.group === g);
        const total = rows.find((l) => l.isTotal);
        const items = rows.filter((l) => !l.isTotal);
        const sumP = items.reduce((a, l) => a + l.planned, 0);
        const sumR = items.reduce((a, l) => a + l.realized, 0);
        const mismatch = total && items.length > 0 && (sumP !== total.planned || sumR !== total.realized);
        return (
          <fieldset key={g} className="overflow-hidden rounded-kpi border border-line-soft bg-white">
            <legend className="sr-only">{label}</legend>
            <div className="flex items-center justify-between border-b border-line-soft bg-card px-4 py-2.5">
              <p className="text-sm font-semibold">{label}</p>
              <div className="flex gap-2">
                {!total && <button type="button" onClick={() => add(g, true)} className="btn-secondary btn-sm">+ Baris total</button>}
                <button type="button" onClick={() => add(g)} className="btn-secondary btn-sm"><Plus aria-hidden className="size-3.5" /> Rincian</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-[13px]">
                <thead className="text-[11px] uppercase tracking-wide text-muted">
                  <tr><th scope="col" className="px-3 py-2 text-left font-medium">Uraian</th><th scope="col" className="w-48 px-2 text-left font-medium">Anggaran (Rp)</th><th scope="col" className="w-48 px-2 text-left font-medium">Realisasi (Rp)</th><th scope="col" className="w-14 px-2 text-right font-medium">%</th><th scope="col" className="w-28"><span className="sr-only">Aksi</span></th></tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {[...(total ? [total] : []), ...items].map((l) => {
                    const p = l.planned ? Math.round((l.realized / l.planned) * 100) : 0;
                    return (
                      <tr key={l.key} className={l.isTotal ? "bg-tint/60 font-medium" : ""}>
                        <td className="px-3 py-1.5">
                          <input aria-label="Uraian" className={cell} value={l.name} onChange={(e) => update(l.key, { name: e.target.value })} />
                          {l.isTotal && <span className="mt-0.5 block text-[11px] text-muted">Baris total kelompok</span>}
                        </td>
                        <td className="px-2"><input aria-label={`Anggaran ${l.name}`} inputMode="numeric" className={`${cell} num text-right`} value={fmt.format(l.planned)} onChange={(e) => update(l.key, { planned: parseRp(e.target.value) })} /></td>
                        <td className="px-2"><input aria-label={`Realisasi ${l.name}`} inputMode="numeric" className={`${cell} num text-right`} value={fmt.format(l.realized)} onChange={(e) => update(l.key, { realized: parseRp(e.target.value) })} /></td>
                        <td className={`num px-2 text-right ${p > 100 ? "text-[#a3236a]" : "text-muted"}`}>{p}%</td>
                        <td className="whitespace-nowrap px-2 text-right">
                          {!l.isTotal && <>
                            <button type="button" aria-label="Naikkan" onClick={() => move(l.key, -1)} className="rounded p-1 text-muted hover:bg-tint hover:text-ink"><ArrowUp className="size-3.5" /></button>
                            <button type="button" aria-label="Turunkan" onClick={() => move(l.key, 1)} className="rounded p-1 text-muted hover:bg-tint hover:text-ink"><ArrowDown className="size-3.5" /></button>
                          </>}
                          <button type="button" aria-label={`Hapus ${l.name || "baris"}`} onClick={() => remove(l.key)} className="rounded p-1 text-muted hover:bg-red-50 hover:text-red-700"><Trash2 className="size-3.5" /></button>
                        </td>
                      </tr>
                    );
                  })}
                  {!rows.length && <tr><td colSpan={5} className="px-4 py-5 text-center text-muted">Belum ada baris.</td></tr>}
                </tbody>
              </table>
            </div>
            {mismatch && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-soft bg-accent/5 px-4 py-2 text-[12.5px]">
                <span className="text-eyebrow">Jumlah rincian (Rp {fmt.format(sumP)} / Rp {fmt.format(sumR)}) berbeda dengan baris total.</span>
                <button type="button" className="btn-secondary btn-sm" onClick={() => update(total!.key, { planned: sumP, realized: sumR })}>Samakan total dengan rincian</button>
              </div>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}
