/** Strip konversi tipis di bawah hero — pola Papermark */
export default function ConversionStrip() {
  return (
    <div className="container-x">
      <div className="flex flex-col items-start justify-between gap-3 rounded-bento border border-line px-4 py-3 sm:flex-row sm:items-center">
        <p className="text-sm text-ink-2">
          <span className="mr-2 inline-block size-2 rounded-full bg-mint align-middle" aria-hidden />
          Butuh surat keterangan? <span className="text-muted">Urus online lewat SiLagas, tanpa antre.</span>
        </p>
        <div className="flex gap-2">
          <a href="/layanan/alur-layanan" className="btn-secondary btn-sm">Lihat alur</a>
          <a href="https://silagas.id" target="_blank" rel="noopener noreferrer" className="btn-primary btn-sm">Buka SiLagas<span className="sr-only"> (tab baru)</span></a>
        </div>
      </div>
    </div>
  );
}
