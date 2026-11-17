import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: "default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
  },
];

const config: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // unggah dokumen lewat server action (maks. 20 MB, lihat src/lib/uploads.ts)
  experimental: { serverActions: { bodySizeLimit: "21mb" } },
  async headers() {
    return [
      // Semua halaman kecuali /uploads (header global akan menimpa header route handler)
      { source: "/:path((?!uploads/).*)", headers: securityHeaders },
      // Dokumen unggahan: sandbox penuh — PDF/gambar tidak bisa menjalankan skrip di origin situs
      {
        source: "/uploads/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Content-Security-Policy", value: "sandbox; default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:" },
        ],
      },
    ];
  },
};

export default config;
