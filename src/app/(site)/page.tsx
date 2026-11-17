import Hero from "@/components/Hero";
import ConversionStrip from "@/components/ConversionStrip";
import SectionHeading from "@/components/SectionHeading";
import ServiceBento from "@/components/ServiceBento";
import StatsSection from "@/components/StatsSection";
import { ApbdesKpis, ApbdesTable } from "@/components/ApbdesPanel";
import NewsSection from "@/components/NewsSection";
import Faq from "@/components/Faq";
import CtaBand from "@/components/CtaBand";
import { getBudget, getPopulation, getPosts, getServices } from "@/lib/data";

export default async function HomePage() {
  const [services, pop, budget, berita, pengumuman] = await Promise.all([
    getServices(), getPopulation(), getBudget(), getPosts({ category: "BERITA", limit: 4 }), getPosts({ category: "PENGUMUMAN", limit: 5 }),
  ]);
  return (
    <>
      <Hero />
      <ConversionStrip />

      <section aria-labelledby="layanan" className="mt-20 bg-bento py-20 md:mt-24 md:py-24">
        <div className="container-x">
          <div id="layanan"><SectionHeading eyebrow="Akses layanan" title="Semua layanan desa, satu pintu." desc="Dari surat keterangan sampai bank sampah — pilih layanan sesuai kebutuhan Anda." href="/layanan" cta="Semua layanan" /></div>
          <ServiceBento services={services} />
        </div>
      </section>

      {pop && (
        <section aria-labelledby="angka" className="py-20 md:py-24">
          <div className="container-x">
            <div id="angka"><SectionHeading eyebrow="Desa dalam angka" title="Mengenal warga Ungasan." href="/profil/statistik" cta="Statistik lengkap" /></div>
            <StatsSection pop={pop} />
          </div>
        </section>
      )}

      {budget && (
        <section aria-labelledby="apbdes" className="border-t border-line py-20 md:py-24">
          <div className="container-x">
            <div id="apbdes"><SectionHeading eyebrow={`APBDes ${budget.year}`} title="Uang desa, terbuka untuk semua." desc="Ringkasan anggaran dan realisasi pendapatan, belanja, dan pembiayaan desa tahun berjalan." href="/transparansi/apbdes" cta="Lihat rincian" /></div>
            <ApbdesKpis budget={budget} />
            <div className="mt-8"><ApbdesTable budget={budget} groups={["belanja"]} /></div>
          </div>
        </section>
      )}

      <section aria-labelledby="kabar" className="border-t border-line py-20 md:py-24">
        <div className="container-x">
          <div id="kabar"><SectionHeading eyebrow="Kabar desa" title="Berita & pengumuman." /></div>
          <NewsSection berita={berita} pengumuman={pengumuman} />
        </div>
      </section>

      <section aria-labelledby="faq" className="border-t border-line py-20 md:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4"><div id="faq"><SectionHeading eyebrow="Tanya jawab" title="Pertanyaan yang sering diajukan." /></div></div>
          <div className="lg:col-span-8"><Faq /></div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
