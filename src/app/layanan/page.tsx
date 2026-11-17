import Link from "next/link";
import PageShell from "@/components/PageShell";
import ServiceBento from "@/components/ServiceBento";
import { getPagesBySection, getServices } from "@/lib/data";

export const metadata = { title: "Layanan" };

export default async function Page() {
  const [services, pages] = await Promise.all([getServices(), getPagesBySection("LAYANAN")]);
  return (
    <PageShell crumbs={[{ label: "Layanan" }]} eyebrow="Akses layanan" title="Layanan Desa" summary="Platform digital dan panduan layanan Pemerintah Desa Ungasan.">
      <ServiceBento services={services} />
      <ul className="mt-10 flex flex-wrap gap-2">
        {pages.map((p) => <li key={p.slug}><Link href={`/layanan/${p.slug}`} className="btn-secondary">{p.title}</Link></li>)}
        <li><Link href="/layanan/buku-tamu" className="btn-secondary">Buku Tamu</Link></li>
      </ul>
    </PageShell>
  );
}
