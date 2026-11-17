import Link from "next/link";
import { CONTACT, NAV } from "@/config/navigation";

const GOV = [
  ["Pemprov Bali", "https://baliprov.go.id"], ["Kabupaten Badung", "https://badungkab.go.id"],
  ["PPID Badung", "https://ppid.badungkab.go.id"], ["SiLagas", "https://silagas.id"],
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-[15px] font-semibold">Pemerintah Desa Ungasan</p>
          <address className="mt-3 text-[13px] not-italic leading-relaxed text-muted">{CONTACT.address}<br />Telp. <a className="hover:text-ink" href={`tel:${CONTACT.phone.replace(/\D/g, "")}`}>{CONTACT.phone}</a></address>
        </div>
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Jelajahi</p>
          <ul className="mt-3 space-y-2 text-[13.5px]">{NAV.map((n) => <li key={n.href}><Link className="hover:underline" href={n.href}>{n.label}</Link></li>)}</ul>
        </div>
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Tautan pemerintah</p>
          <ul className="mt-3 space-y-2 text-[13.5px]">{GOV.map(([l, h]) => <li key={l}><a className="hover:underline" href={h} target="_blank" rel="noopener noreferrer">{l}</a></li>)}</ul>
        </div>
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Ikuti kami</p>
          <ul className="mt-3 space-y-2 text-[13.5px]">
            <li><a className="hover:underline" href={CONTACT.instagram} target="_blank" rel="noopener noreferrer">Instagram @humasungasan</a></li>
            <li><a className="hover:underline" href={CONTACT.youtube} target="_blank" rel="noopener noreferrer">YouTube Desa Ungasan</a></li>
            <li><Link className="hover:underline" href="/layanan/buku-tamu">Buku Tamu</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col justify-between gap-2 py-5 text-[12px] text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Pemerintah Desa Ungasan</p>
          <p>Kode sumber terbuka · lisensi MIT</p>
        </div>
      </div>
    </footer>
  );
}
