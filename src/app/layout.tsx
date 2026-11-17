import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

// ADR-04: semua halaman dinamis — data selalu segar, build tidak butuh DB
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Desa Ungasan — terbuka dan melayani", template: "%s · Desa Ungasan" },
  description: "Website resmi Pemerintah Desa Ungasan, Kuta Selatan, Badung, Bali: layanan, APBDes, statistik, berita, dan pengumuman.",
  openGraph: { type: "website", locale: "id_ID", siteName: "Desa Ungasan" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-dvh">
        <SiteHeader />
        <main id="konten">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
