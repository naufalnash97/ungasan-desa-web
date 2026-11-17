import { Users, User, UserRound, Home } from "lucide-react";
import { angka, ribu, tanggal } from "@/lib/format";
import type { getPopulation } from "@/lib/data";

type Pop = NonNullable<Awaited<ReturnType<typeof getPopulation>>>;

/** KPI kependudukan — pola Basedash (docs/04-DBD.md §4) */
export default function StatsSection({ pop }: { pop: Pop }) {
  const kpis = [
    { label: "Jumlah penduduk", value: pop.penduduk, unit: "jiwa", icon: Users },
    { label: "Laki-laki", value: pop.laki, unit: "jiwa", icon: User },
    { label: "Perempuan", value: pop.perempuan, unit: "jiwa", icon: UserRound },
    { label: "Kepala keluarga", value: pop.kk, unit: "KK", icon: Home },
  ];
  const pL = pop.penduduk ? (pop.laki / pop.penduduk) * 100 : 0;
  return (
    <div className="grid gap-3 lg:grid-cols-12">
      <dl className="grid grid-cols-2 gap-3 lg:col-span-8">
        {kpis.map(({ label, value, unit, icon: Icon }) => (
          <div key={label} className="card-kpi p-5">
            <dt className="flex items-center gap-2 text-[13px] text-muted"><Icon aria-hidden className="size-4" /> {label}</dt>
            <dd className="num mt-3 text-[2.25rem] font-semibold leading-none tracking-[-0.02em] md:text-[2.75rem]">
              {ribu(value)}<span className="ml-1.5 text-sm font-normal tracking-normal text-muted">{unit}</span>
            </dd>
          </div>
        ))}
      </dl>
      <div className="card-kpi flex flex-col justify-between p-5 lg:col-span-4">
        <div>
          <p className="text-[13px] text-muted">Rasio jenis kelamin</p>
          <div className="mt-4 flex h-3 overflow-hidden rounded-full" role="img"
            aria-label={`Laki-laki ${angka(pL, 1)} persen, perempuan ${angka(100 - pL, 1)} persen`}>
            <div style={{ width: `${pL}%` }} className="bg-c-blue" />
            <div style={{ width: `${100 - pL}%` }} className="bg-c-pink" />
          </div>
          <div className="mt-3 flex justify-between text-[13px]">
            <span className="flex items-center gap-1.5"><i aria-hidden className="size-2 rounded-full bg-c-blue" /> Laki-laki <b className="num">{angka(pL, 1)}%</b></span>
            <span className="flex items-center gap-1.5"><i aria-hidden className="size-2 rounded-full bg-c-pink" /> Perempuan <b className="num">{angka(100 - pL, 1)}%</b></span>
          </div>
        </div>
        <div className="mt-6 border-t border-line pt-4">
          <p className="text-[13px] text-muted">Rata-rata anggota per KK</p>
          <p className="num mt-1 text-3xl font-semibold tracking-tight">{angka(pop.rataPerKk, 2)} <span className="text-sm font-normal text-muted">jiwa</span></p>
        </div>
      </div>
      <p className="text-[12px] text-muted lg:col-span-12">Data {pop.year}{pop.asOf ? ` · diperbarui ${tanggal(pop.asOf)}` : ""} · sumber: administrasi kependudukan Desa Ungasan</p>
    </div>
  );
}
