# 05 — BSD · Backend Schema Document

> **Pemilik:** Backend Architect (`engineering-backend-architect.md`) + Database Optimizer (`engineering-database-optimizer.md`) · **Reviewer:** Code Reviewer
> **Sumber kebenaran:** `src/db/schema.ts` (Drizzle ORM) → migrasi SQL di `drizzle/`

## 1. ERD

```
┌──────────────┐        ┌──────────────────┐
│   budgets    │ 1    N │   budget_lines   │
│──────────────│◀───────│──────────────────│
│ id PK        │        │ id PK            │
│ year         │        │ budget_id FK ────┘ ON DELETE CASCADE
│ version  ENUM│        │ group ENUM       │  PENDAPATAN|BELANJA|PEMBIAYAAN
│ as_of        │        │ name             │
│ is_current   │        │ is_total         │  baris total kelompok
│ UQ(year,ver) │        │ planned  BIGINT  │  rupiah penuh
│ UQ(is_current│        │ realized BIGINT  │
│   ) WHERE t  │        │ sort_order       │
└──────────────┘        └──────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  ┌────────────────────┐
│    pages     │  │    posts     │  │    documents     │  │  population_stats  │
│ section ENUM │  │ category ENUM│  │ category ENUM    │  │ year, category,    │
│ slug         │  │ slug UQ      │  │ year             │  │ label UQ(y,c,l)    │
│ title, body  │  │ title, body  │  │ title, file_url  │  │ male, female, total│
│ external_url │  │ published_at │  │ published_at     │  │ as_of              │
│ UQ(sec,slug) │  │ IDX feed,FTS │  │ IDX(cat,year)    │  └────────────────────┘
└──────────────┘  └──────────────┘  └──────────────────┘
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  ┌────────────────────┐
│   services   │  │  officials   │  │ guestbook_entries│  │   site_settings    │
│ slug UQ      │  │ name,position│  │ name, origin,    │  │ key PK, value      │
│ status ENUM  │  │ unit, photo  │  │ purpose, message │  └────────────────────┘
│ bento_span   │  └──────────────┘  │ ip_hash, approved│
└──────────────┘                    └──────────────────┘
```

## 2. Keputusan desain data
| Keputusan | Alasan |
|---|---|
| Rupiah sebagai `BIGINT` (bukan `numeric`/`float`) | APBDes tanpa sen; aritmetika eksak; muat s.d. 9×10¹⁵ |
| `budgets(year, version)` unik + versi `MURNI/PERUBAHAN/PERUBAHAN_KEDUA` | Menggantikan menu level-3/4 lama ("APBDesa Perubahan Kedua 2025") dengan data terstruktur |
| *Partial unique index* `is_current = true` | DB menjamin hanya satu APBDes tampil di beranda |
| Baris total disimpan (`is_total`) bukan dihitung | Total resmi bisa berbeda dari jumlah rincian (pembulatan, pos lain) — tampilkan apa yang ditetapkan |
| `population_stats` model EAV ringan (category/label) | Kategori baru (stunting, disabilitas, banjar) tanpa migrasi |
| `pages` generik per `section` | Satu template untuk ±30 halaman statis situs lama |
| `ip_hash` SHA-256+salt | Anti-spam tanpa menyimpan data pribadi |
| GIN FTS `to_tsvector('simple', title‖body)` | Siap untuk fitur pencarian (F12) |

## 3. Indeks & pola query
| Query | Indeks |
|---|---|
| Feed berita per kategori terbaru | `posts_feed_idx (category, published, published_at DESC)` |
| Halaman per section/slug | `pages_section_slug_uq` |
| Dokumen per kategori & tahun | `documents_cat_year_idx` |
| Rincian APBDes | `budget_lines_budget_group_idx (budget_id, group)` |

## 4. Kontrak REST `/api/v1`

Format sukses `{ "data": … }`; galat `{ "error": { "code", "message", "details?" } }`.

| Metode | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/api/health` | publik | `{status, db}` — 503 bila DB mati |
| GET | `/api/v1/berita?kategori=&limit=&offset=` | publik | `kategori` ∈ BERITA, PENGUMUMAN, VIDEO; limit ≤ 50 |
| GET | `/api/v1/berita/{slug}` | publik | 404 bila tidak ada |
| POST | `/api/v1/berita` | **admin** | 201 / 409 `SLUG_TAKEN` / 422 |
| PUT | `/api/v1/berita/{slug}` | **admin** | partial update |
| DELETE | `/api/v1/berita/{slug}` | **admin** | 204 |
| GET | `/api/v1/apbdes?tahun=&versi=` | publik | tanpa parameter = versi aktif; menyertakan `available[]` |
| PUT | `/api/v1/apbdes` | **admin** | upsert atomik satu APBDes + rincian |
| GET | `/api/v1/statistik?tahun=` | publik | ringkasan + semua baris |
| GET | `/api/v1/layanan` | publik | daftar layanan bento |
| GET | `/api/v1/dokumen?kategori=&tahun=` | publik | arsip transparansi |
| GET | `/api/v1/halaman/{section}/{slug}` | publik | konten halaman generik |
| POST | `/api/v1/buku-tamu` | publik | rate-limit 5/menit/IP, honeypot `website` |
| GET | `/api/v1/buku-tamu` | **admin** | 200 entri terbaru |

Contoh — memperbarui APBDes Perubahan 2026:
```bash
curl -X PUT https://ungasan.desa.id/api/v1/apbdes \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" -H "Content-Type: application/json" \
  -d '{"year":2026,"version":"PERUBAHAN","asOf":"2026-12-01","isCurrent":true,
       "lines":[{"group":"PENDAPATAN","name":"Pendapatan Desa","isTotal":true,"planned":34000000000,"realized":25000000000}]}'
```

## 5. Migrasi & seed
```bash
npm run db:generate   # schema.ts → drizzle/NNNN_*.sql (commit file ini)
npm run db:migrate    # terapkan ke DATABASE_URL
npm run db:seed       # data riil Ungasan (idempoten)
```
Aturan: migrasi hanya maju; kolom baru `NULL`/default dulu, backfill, baru `NOT NULL`.
