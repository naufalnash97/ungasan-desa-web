# 02 — TRD · Technical Requirement Document

> **Pemilik:** Software Architect (`engineering-software-architect.md`) · **Reviewer:** Backend Architect

## 1. Prinsip arsitektur
1. **100% open-source** — setiap komponen berlisensi OSI (lihat §6).
2. **Satu deployable** — monolit modular Next.js (UI + REST API) + PostgreSQL. Cukup untuk trafik desa (< 50 rps), mudah di-host.
3. **Server-first** — React Server Components membaca DB langsung; JS di browser hanya untuk mega-menu, filter APBDes, dan form.
4. **Kontrak API stabil** di `/api/v1`, dipakai juga untuk open data.

## 2. Diagram konteks

```
            ┌──────────── Browser warga (mobile-first) ────────────┐
            │  HTML (RSC)  +  JS kecil: MegaMenu, ApbdesFilter, Form │
            └───────────────┬──────────────────────────────────────┘
                            │ HTTPS
                 ┌──────────▼───────────┐       Tautan keluar:
                 │  Next.js 15 (Node 22) │──────▶ SiLagas, Paduraksa,
                 │  ├─ app/ (halaman)    │        SIANDU, dKari, YouTube
                 │  └─ app/api/v1 (REST) │
                 └──────────┬───────────┘
                            │ Drizzle ORM (pg pool)
                 ┌──────────▼───────────┐
                 │   PostgreSQL 16       │  + volume /uploads (dokumen PDF)
                 └──────────────────────┘
```

## 3. Stack

| Lapisan | Teknologi | Alasan |
|---|---|---|
| Frontend | Next.js 15 App Router, React 19, TypeScript 5 | SSR/SEO, RSC, satu bahasa end-to-end |
| Styling | Tailwind CSS 4 + design tokens CSS variables | Token dari DBD, tanpa runtime CSS-in-JS |
| Font | Inter Variable (`@fontsource-variable/inter`), Instrument Serif untuk kutipan | Self-hosted, tanpa Google Fonts (privasi & offline build) |
| Ikon | lucide-react (ISC) | Ringan, tree-shakeable |
| Backend | Next.js Route Handlers (`/api/v1/*`) + Zod | Validasi skema, kontrak tipe-aman |
| ORM | Drizzle ORM + node-postgres | Type-safe, migrasi berupa file SQL, tanpa binary engine (lihat IPD §6) |
| Database | PostgreSQL 16 | Open-source, JSON, full-text search bahasa Indonesia (`simple`) |
| Markdown | marked + sanitize-html | Konten halaman dari operator, disanitasi di server |
| Container | Docker + docker-compose | Deploy satu perintah |
| CI | GitHub Actions | Lint, typecheck, build, migrasi pada Postgres service |

## 4. Kebutuhan non-fungsional

| Kategori | Kebutuhan |
|---|---|
| Performa | LCP < 2,5 s di 4G; JS awal < 100 KB gz; gambar `next/image` |
| Aksesibilitas | WCAG 2.1 AA: kontras ≥ 4.5:1, focus ring terlihat, `aria-expanded` di mega-menu, skip link |
| Keamanan | Header keamanan (CSP dasar, X-Frame-Options, Referrer-Policy); admin API via `Authorization: Bearer <ADMIN_API_TOKEN>` (perbandingan constant-time); rate-limit 5 req/menit/IP untuk POST buku tamu; honeypot field; HTML konten disanitasi |
| Privasi | Tidak ada cookie pelacak; IP buku tamu disimpan sebagai hash SHA-256 + salt |
| Ketersediaan | `GET /api/health` cek koneksi DB; restart policy container |
| SEO | Metadata per halaman, Open Graph, `sitemap.xml`, `robots.txt` |
| i18n | `lang="id"`, format `Intl.NumberFormat('id-ID')` untuk rupiah |
| Observabilitas | Log JSON ke stdout; error boundary per segmen |

## 5. Struktur repo

```
.
├── docs/                 # 00–06 dokumen produk
├── .claude/agents/       # persona dari agency-agents
├── drizzle/              # migrasi SQL hasil drizzle-kit
├── src/db/
│   ├── schema.ts         # skema (sumber kebenaran)
│   ├── index.ts          # koneksi pool
│   └── seed.ts           # data riil Ungasan (APBDes 2026, statistik, berita)
├── src/
│   ├── app/
│   │   ├── (site)/...    # halaman publik
│   │   └── api/v1/...    # REST
│   ├── components/       # MegaMenu, Hero, ServiceBento, StatsGrid, ApbdesPanel, ...
│   ├── config/navigation.ts
│   └── lib/              # db.ts, data.ts, format.ts, auth.ts, rate-limit.ts
├── Dockerfile
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## 6. Lisensi komponen
Next.js (MIT), React (MIT), Drizzle ORM (Apache-2.0), node-postgres (MIT), PostgreSQL (PostgreSQL License), Tailwind (MIT), Zod (MIT), lucide (ISC), marked (MIT), sanitize-html (MIT), Inter (OFL), Instrument Serif (OFL). Kode proyek: **MIT**.

## 7. Konfigurasi (env)

| Variabel | Contoh | Wajib |
|---|---|---|
| `DATABASE_URL` | `postgresql://ungasan:ungasan@localhost:5432/ungasan` | ya |
| `ADMIN_API_TOKEN` | string acak ≥ 32 karakter | ya untuk endpoint admin |
| `IP_HASH_SALT` | string acak | ya |
| `NEXT_PUBLIC_SITE_URL` | `https://ungasan.desa.id` | ya |
| `UPLOAD_DIR` | `/app/uploads` (volume Docker) | tidak (default `./uploads`) |

## 8. Keputusan arsitektur (ADR ringkas)
- **ADR-01 Monolit Next.js vs API terpisah** → monolit; pisah menjadi service lain hanya jika ada konsumen API selain web.
- **ADR-02 Navigasi di kode, bukan DB** → struktur menu jarang berubah dan perlu type-safety; konten tiap halaman tetap di DB.
- **ADR-05 Drizzle, bukan Prisma** → tidak butuh binary engine, migrasi SQL bisa direview DBA.
- **ADR-06 Panel admin dibangun sendiri (v1.1), bukan Payload/Directus** → CMS eksternal membuat tabel sendiri dan menggandakan skema; panel bawaan memakai tabel & validasi yang sama dengan API, satu container, satu login. Lihat BSD §6.
- **ADR-03 Tanpa CMS di v1** → menghindari lock-in & beban hosting; skema dirancang agar Payload CMS (MIT) bisa ditempel di fase 2.
- **ADR-04 Halaman dinamis (`force-dynamic`)** → data selalu segar dan build tidak butuh DB; caching via `Cache-Control` di reverse proxy bila trafik naik.
