/** Band penutup oranye — satu-satunya blok aksen penuh (Papermark) */
export default function CtaBand() {
  return (
    <section className="bg-accent">
      <div className="container-x flex flex-col items-start justify-between gap-6 py-14 md:flex-row md:items-center">
        <div>
          <h2 className="h-section text-ink">Ada keluhan atau aspirasi?</h2>
          <p className="mt-2 max-w-[48ch] text-ink/80">Setiap laporan dicatat dan ditindaklanjuti. Sampaikan langsung, tanpa perlu datang ke kantor desa.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href="https://paduraksa.id" target="_blank" rel="noopener noreferrer" className="btn-primary h-11 px-5">Sampaikan via Paduraksa<span className="sr-only"> (tab baru)</span></a>
          <a href="/layanan/buku-tamu" className="btn h-11 border border-ink/25 px-5 text-ink hover:bg-white/30">Isi Buku Tamu</a>
        </div>
      </div>
    </section>
  );
}
