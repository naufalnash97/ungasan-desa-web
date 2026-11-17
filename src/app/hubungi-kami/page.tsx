import PageShell from "@/components/PageShell";
import { CONTACT } from "@/config/navigation";

export const metadata = { title: "Hubungi Kami" };

export default function Page() {
  const items = [
    ["Alamat", CONTACT.address], ["Telepon", CONTACT.phone], ["Jam layanan", "Senin–Jumat, 08.00–15.00 WITA"],
  ];
  return (
    <PageShell crumbs={[{ label: "Hubungi Kami" }]} eyebrow="Kontak" title="Hubungi Kami" summary="Kantor Perbekel Desa Ungasan.">
      <dl className="grid max-w-3xl gap-3 sm:grid-cols-3">
        {items.map(([k, v]) => <div key={k} className="card-kpi p-5"><dt className="text-[13px] text-muted">{k}</dt><dd className="mt-2 text-sm font-medium">{v}</dd></div>)}
      </dl>
      <div className="mt-8 flex flex-wrap gap-3">
        <a className="btn-primary" href={`tel:${CONTACT.phone.replace(/\D/g, "")}`}>Telepon kantor desa</a>
        <a className="btn-secondary" href="https://paduraksa.id" target="_blank" rel="noopener noreferrer">Pengaduan (Paduraksa)</a>
        <a className="btn-secondary" href="/layanan/buku-tamu">Buku Tamu</a>
      </div>
    </PageShell>
  );
}
