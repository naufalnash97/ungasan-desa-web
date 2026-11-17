# 06 — IPD · Implementation Plan Document

> **Pemilik:** Senior Project Manager (`project-manager-senior.md`) · **Reviewer:** Product Manager

## 1. Fase & status

| Fase | Isi | Agent | Status |
|---|---|---|---|
| **0. Discovery** | Audit ungasan.desa.id, kurasi template Kage (Papermark, Context Engine/Sponkly, Basedash) | Product Manager, UX Architect | ✅ |
| **1. Dokumen** | PRD → TRD → AFD → DBD → BSD → IPD | sesuai `00-AGENT-WORKFLOW.md` | ✅ |
| **2. Database** | Skema Drizzle, migrasi `0000_init`, seed data riil (APBDes 2026, penduduk, berita, 22 halaman, 14 dokumen) | Database Optimizer | ✅ |
| **3. Backend** | 14 endpoint REST, validasi Zod, admin token, rate-limit, sanitasi Markdown | Backend Architect | ✅ |
| **4. Frontend** | Mega-menu 5 item, hero, strip konversi, bento layanan, KPI penduduk, APBDes, berita, FAQ, CTA band, footer; 25 rute | Frontend Developer, UI Designer | ✅ |
| **5. DevOps** | Dockerfile multi-stage, docker-compose (app + Postgres), GitHub Actions CI | DevOps Automator | ✅ |
| **6. QA** | Build, uji rute & API, screenshot desktop/mobile, review kode & a11y | Code Reviewer, Reality Checker, Accessibility Auditor | ✅ v1 |
| **7. Konten** | Operator mengisi teks resmi, unggah PDF, foto perangkat | Operator desa | ⏳ |
| **8. Panel admin** | `/admin`: login, peran Admin/Editor, CRUD berita/halaman/APBDes/dokumen/statistik/layanan, unggah PDF, buku tamu + CSV, pengguna, log audit | Backend Architect, Frontend Developer, Code Reviewer | ✅ v1.1 |
| **9. Fase berikutnya** | Pencarian FTS, peta OSM, unggah foto berita, 2FA admin, integrasi dKari | — | 📋 |

## 2. Langkah pembuatan (reproducible)

```bash
# 1. Siapkan repo & agent
git clone https://github.com/naufalnash97/ungasan-desa-web && cd ungasan-desa-web
ls .claude/agents            # 13 persona dari agency-agents

# 2. Database (Docker)
cp .env.example .env
docker compose up -d db

# 3. Dependensi, migrasi, seed
npm ci
npm run db:migrate
npm run db:seed

# 4. Jalankan
npm run dev                  # http://localhost:3000

# 5. Produksi
docker compose up -d --build # app + db, migrasi otomatis saat start
```

## 3. Breakdown tugas (sprint 2 minggu)

| # | Tugas | Est. | Dependensi |
|---|---|---|---|
| T1 | Skema + migrasi + seed | 1 h | BSD |
| T2 | Lapisan data `lib/data.ts` | 0,5 h | T1 |
| T3 | REST publik + admin | 1,5 h | T2 |
| T4 | Design tokens + Tailwind | 0,5 h | DBD |
| T5 | Header, mega-menu, drawer mobile | 1 h | T4, AFD |
| T6 | Beranda (hero → CTA band) | 1,5 h | T2, T4 |
| T7 | Halaman generik per section | 0,5 h | T2 |
| T8 | APBDes + filter, Dokumen, Statistik | 1 h | T2 |
| T9 | Berita, Buku Tamu, Kontak, 404, sitemap | 1 h | T3 |
| T10 | Docker + CI | 0,5 h | T1–T9 |
| T11 | QA: a11y, Lighthouse, review | 1 h | semua |
| T12 | Pengisian konten oleh operator + pelatihan Admin API | 3 h | T3 |

## 4. Quality gate (Reality Checker)
- [x] `npm run build` hijau, `tsc --noEmit` bersih
- [x] Semua rute utama 200, rute tak dikenal 404
- [x] API: 401 tanpa token, 422 validasi, 429 rate-limit, `<script>` tersanitasi
- [x] Mega-menu: `aria-expanded`, Esc menutup & kembalikan fokus, drawer mobile
- [ ] Lighthouse mobile ≥ 90/95 di server produksi (jalankan setelah deploy)
- [ ] Uji 5 warga untuk metrik "paham APBDes < 15 detik"

### Quality gate panel admin (uji end-to-end Playwright, 21 skenario lulus)
- [x] Login salah ditolak, login benar → dasbor; logout mencabut sesi
- [x] Validasi gagal tidak menghapus isian operator
- [x] Berita baru → tampil di situs & announcement bar; hapus dengan konfirmasi
- [x] Ubah realisasi APBDes → angka publik berubah; peringatan selisih total
- [x] PDF asli terunggah & tersaji `application/pdf`; file palsu berekstensi .pdf ditolak
- [x] Statistik & layanan → beranda berubah; buku tamu ditinjau + ekspor CSV
- [x] Editor tidak bisa membuka Pengguna; aksi tercatat di Log Audit
- [x] Review keamanan independen oleh agent **Code Reviewer** — 0 bypass autentikasi; 7 temuan (3 medium, 4 low) semuanya diperbaiki & diuji:
  rate-limit memakai IP hop proxy tepercaya & tidak bisa di-reset · ganti password mencabut sesi lain · field opsional berita bisa dikosongkan ·
  `setRole` divalidasi runtime · `saveBudget` dikunci & pesan galat tepat · semua URL wajib `https://` · unggahan cache 1 jam + `CSP: sandbox`
- [x] Temuan tambahan saat uji: limit login hanya menghitung kegagalan (6× login sukses tidak terkunci); tanpa proxy, IP "unknown" tidak dijadikan kunci limit

## 5. Risiko & mitigasi
| Risiko | P | D | Mitigasi |
|---|---|---|---|
| Operator kesulitan memakai API | Rendah | Sedang | Panel admin `/admin` (v1.1); API tetap tersedia untuk integrasi |
| Password operator lemah / bocor | Sedang | Tinggi | Minimal 12 karakter, rate-limit login, admin bisa nonaktifkan & reset; 2FA di fase berikutnya |
| Tautan eksternal (SiLagas dll.) berubah | Sedang | Rendah | URL di tabel `services`, ubah tanpa deploy |
| Rate-limit in-memory tidak berbagi antar instance | Rendah | Rendah | Satu instance cukup; Redis bila scale-out |

## 6. Catatan perubahan dari TRD awal
- **ORM: Prisma → Drizzle.** Prisma membutuhkan unduhan binary engine yang diblokir di lingkungan build; Drizzle (Apache-2.0) murni JavaScript, migrasinya file SQL biasa, dan tetap 100% open-source.
- **Aksesibilitas:** warna eyebrow `#F45B0B` (kontras 3,4:1) diganti `#C2410C` (5,2:1) dan teks muted digelapkan ke `#6B6F78` atas rekomendasi Accessibility Auditor.
