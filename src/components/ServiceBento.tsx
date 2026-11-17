import {
  ArrowUpRight, BookOpen, Boxes, FileText, GraduationCap, HeartPulse, Landmark, MessageSquareWarning, Mic, Recycle, Truck, type LucideIcon,
} from "lucide-react";
import type { getServices } from "@/lib/data";

const ICONS: Record<string, LucideIcon> = { FileText, MessageSquareWarning, HeartPulse, Landmark, Recycle, Boxes, GraduationCap, BookOpen, Truck, Mic };

// Grid 12 kolom (docs/04-DBD.md §4 — Bento Context Engine / Sponkly)
const SPAN: Record<string, string> = {
  xl: "sm:col-span-2 lg:col-span-6 lg:row-span-2",
  lg: "sm:col-span-2 lg:col-span-6",
  md: "lg:col-span-3",
  sm: "lg:col-span-3",
};

type Service = Awaited<ReturnType<typeof getServices>>[number];

function StatusChip({ status }: { status: Service["status"] }) {
  return status === "ONLINE" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-mint/15 px-2 py-0.5 text-[11px] font-medium text-mint-ink">
      <span aria-hidden className="size-1.5 rounded-full bg-mint" /> Online
    </span>
  ) : (
    <span className="rounded-full bg-tint px-2 py-0.5 text-[11px] font-medium text-muted">Info</span>
  );
}

function SilagasMock() {
  const rows = [
    ["Surat Keterangan Usaha", "Selesai"],
    ["Surat Domisili", "Diverifikasi"],
    ["Keterangan Tidak Mampu", "Diajukan"],
  ];
  return (
    <div aria-hidden className="mt-6 rounded-md border border-line bg-white p-3 text-[12.5px]">
      <p className="mb-2 font-medium text-ink">Status pengajuan</p>
      <ul className="divide-y divide-line">
        {rows.map(([t, s], i) => (
          <li key={t} className="flex items-center justify-between py-2">
            <span className="text-ink-2">{t}</span>
            <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${i === 0 ? "bg-mint/15 text-mint-ink" : "bg-tint text-muted"}`}>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ServiceBento({ services }: { services: Service[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[minmax(150px,auto)]">
      {services.map((s) => {
        const Icon = ICONS[s.icon] ?? FileText;
        const external = s.url.startsWith("http");
        return (
          <li key={s.slug} className={SPAN[s.bentoSpan] ?? SPAN.sm}>
            <a href={s.url} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group relative flex h-full flex-col rounded-bento border border-[#e4e7e5] bg-white p-5 transition duration-150 hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-[0_4px_12px_-6px_rgba(0,0,0,.12)]">
              <div className="flex items-start justify-between">
                <span className="grid size-9 place-items-center rounded-md bg-tint"><Icon aria-hidden className="size-[18px] text-ink" /></span>
                <ArrowUpRight aria-hidden className="size-4 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <h3 className={`font-semibold tracking-tight ${s.bentoSpan === "xl" ? "text-xl" : "text-[1.0625rem]"}`}>{s.name}</h3>
                <StatusChip status={s.status} />
              </div>
              <p className="mt-0.5 text-[13px] font-medium text-ink-2">{s.tagline}</p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{s.description}</p>
              {s.bentoSpan === "xl" && <SilagasMock />}
              {external && <span className="sr-only"> (membuka tab baru)</span>}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
