import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="h-section mt-3">Halaman tidak ditemukan</h1>
      <p className="mt-3 text-muted">Mungkin halaman ini sudah dipindahkan saat menu dirampingkan.</p>
      <Link href="/" className="btn-primary mt-8">Kembali ke beranda</Link>
    </div>
  );
}
