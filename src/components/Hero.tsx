import Link from "next/link";
import { ShieldCheck, BadgeCheck, MapPin, ArrowRight } from "lucide-react";

const marks = [
  { icon: BadgeCheck, label: "Desa Digital" },
  { icon: ShieldCheck, label: "PPID Terbuka" },
  { icon: MapPin, label: "Kab. Badung, Bali" },
];

/** Hero editorial — gaya Papermark (docs/04-DBD.md §4) */
export default function Hero() {
  return (
    <section className="relative">
      <div className="container-x pb-14 pt-16 text-center md:pb-20 md:pt-24">
        <ul className="mb-8 flex flex-wrap items-center justify-center gap-2" aria-label="Status desa">
          {marks.map(({ icon: Icon, label }) => (
            <li key={label} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-[12.5px] text-muted">
              <Icon aria-hidden className="size-3.5 text-ink" /> {label}
            </li>
          ))}
        </ul>
        <h1 className="h-display mx-auto max-w-[16ch]">
          Desa Ungasan,<br />
          <span className="text-muted">terbuka dan melayani.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-[52ch] text-[1.0625rem] leading-relaxed text-muted">
          Urus administrasi, pantau APBDes, dan ikuti kabar desa dari satu tempat — untuk 16.719 warga di 4.047 keluarga.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/layanan" className="btn-primary h-11 px-5">Ajukan Layanan <ArrowRight aria-hidden className="size-4" /></Link>
          <Link href="/transparansi/apbdes" className="btn-secondary h-11 px-5">Lihat APBDes 2026</Link>
        </div>
      </div>
    </section>
  );
}
