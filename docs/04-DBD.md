# 04 — DBD · Design Brief Document

> **Pemilik:** UI Designer (`design-ui-designer.md`) · **Reviewer:** UX Architect
> **Sumber template:** [kage.design/design/landing-page](https://kage.design/design/landing-page)

## 1. Arah visual
**"Balai desa yang rapi."** Minimal, korporat-editorial, tenang. Hierarki dari skala dan ruang kosong, bukan dekorasi. Warna aksen dipakai hemat, hanya pada momen penting.

| Bagian | Template acuan | Yang diambil |
|---|---|---|
| Hero, tipografi, nada visual | **[Papermark Data Rooms](https://kage.design/designs/papermark-data-rooms-landing-page)** | Hero terpusat, tanda kecil di atas headline, headline 2 baris rapat 56–72px, tombol primer hitam + sekunder bergaris, strip konversi tipis di bawah hero, tabel baris abu selang-seling, CTA band oranye penutup, footer putih multi-kolom |
| Akses Layanan | **[Context Engine](https://kage.design/designs/context-engine-landing-page)** / **[Sponkly](https://kage.design/designs/sponkly-landing-page)** | Bento di latar abu pucat `#F7F8F7`, kartu putih datar, border 1px `#E4E7E5`, radius 8px, hampir tanpa shadow, angkat halus saat hover, chip status hijau mint |
| Data & APBDes | **[Basedash](https://kage.design/designs/basedash-view-only-members-landing-page)** | Kartu KPI radius 12–16px, border hairline `#EBEBED`, fill `#FAFAFB`, shadow `0 1px 2px rgba(0,0,0,.04)`, palet chart biru/hijau/oranye/pink, eyebrow label oranye |

## 2. Design tokens

```css
:root {
  /* Netral (Papermark) */
  --ink: #111111;        --ink-2: #16171B;
  --muted: #71757E;      --line: #E6E7E8;   --line-soft: #EBEBED;
  --tint: #F4F5F6;       --canvas: #FFFFFF; --bento-bg: #F7F8F7;
  --card-fill: #FAFAFB;
  /* Aksen */
  --accent: #FF7A00;     /* CTA band, badge — hemat */
  --eyebrow: #F45B0B;    /* label kecil di atas judul seksi */
  --mint: #39D6AA;  --mint-ink: #147B62;   /* status "Online", chip layanan */
  /* Chart (Basedash) */
  --c-blue: #3E7BFA; --c-green: #2FA97C; --c-orange: #FF9540; --c-pink: #F06AA8;
  /* Radius */
  --r-btn: 6px; --r-bento: 8px; --r-kpi: 14px;
}
```

Kontras teks: `--ink` di putih 18.9:1. **Koreksi Accessibility Auditor:** `--muted` digelapkan ke `#6B6F78` (5,1:1) dan `--eyebrow` ke `#C2410C` (5,2:1) karena `#F45B0B` hanya 3,4:1 untuk teks kecil, putih di `--accent` hanya untuk teks ≥ 18px bold → pakai teks `--ink` di band oranye agar 7.4:1.

## 3. Tipografi
| Peran | Font | Ukuran / tinggi baris / tracking |
|---|---|---|
| Display (hero) | Inter Variable 600 | `clamp(2.5rem, 6vw, 4.5rem)` / 1.02 / −0.035em |
| H2 seksi | Inter 600 | `clamp(1.875rem, 3.2vw, 2.5rem)` / 1.1 / −0.02em |
| H3 kartu | Inter 600 | 1.125rem / 1.3 |
| Body | Inter 400 | 1rem / 1.6, warna `--muted`, lebar maks 62ch |
| Eyebrow | Inter 500 | 0.8125rem, uppercase, tracking 0.08em, `--eyebrow` |
| Angka KPI | Inter 600, `tabular-nums` | 2.25–2.75rem / 1 / −0.02em |
| Kutipan (moto desa) | Instrument Serif italic | 1.75rem |
| Tabel / footer | Inter 400 | 0.8125rem |

## 4. Komponen

**Header** — announcement bar 32px (latar `--ink`, teks putih), header 64px, wordmark kiri ("Desa Ungasan" + lambang), 5 menu tengah, kanan: ikon cari + tombol primer "Hubungi Kami".

**Mega-menu** — panel lebar penuh, latar putih, border bawah `--line`, grid 3 kolom grup + 1 kolom *featured* (kartu abu dengan CTA). Setiap tautan: judul 14px ink + deskripsi 13px muted.

**Hero** — terpusat, padding atas 96px. Baris tanda: 3 chip kecil ("Desa Digital", "PPID Terbuka", "Kab. Badung"). Headline 2 baris. Subcopy ≤ 2 baris. Tombol: primer hitam "Ajukan Layanan", sekunder bergaris "Lihat APBDes 2026". Di bawahnya strip bergaris tipis: kiri "Butuh surat keterangan? Urus online lewat SiLagas." kanan dua tombol kecil.

**Bento Akses Layanan** (grid 6 kolom desktop, 2 kolom tablet, 1 mobile):
```
┌───────────────────────┬───────────┬───────────┐
│ SiLagas (span 3×2)    │ Pengaduan │  SIANDU   │
│ + mini mock "status   │ (span 1.5)│ (span 1.5)│
│   surat"              ├───────────┴───────────┤
│                       │ dKari  (span 3)        │
├───────────┬───────────┼───────────┬───────────┤
│ PISAH     │ MANATA    │ DigiHub   │ Perpus    │  (span 1.5 masing-masing)
└───────────┴───────────┴───────────┴───────────┘
```
Kartu: ikon 20px dalam kotak 36px `--tint`, judul, deskripsi 1–2 baris, chip mint "Online" atau abu "Info", panah ↗ di pojok kanan atas.

**KPI (Desa dalam Angka)** — 4 kartu: Penduduk, Laki-laki, Perempuan, KK; + kartu lebar bar rasio gender dan "rata-rata 4,13 jiwa/KK". Caption kecil "Data 2026 · diperbarui 17/11/2026".

**APBDes** — 3 kartu KPI (Pendapatan biru, Belanja oranye, Pembiayaan hijau): label, realisasi besar, "dari Rp X", progress bar 6px, persentase. Di bawahnya tabel rincian: baris selang-seling `--tint`, kolom Uraian | Anggaran | Realisasi | bar + %. Persentase > 100% diberi chip pink "melebihi target".

**CTA band** — latar `--accent`, teks `--ink`, judul "Ada keluhan atau aspirasi?", tombol hitam "Sampaikan via Paduraksa".

**Footer** — 4 kolom: identitas & alamat, Jelajahi, Tautan Pemerintah, Kontak & sosial; baris bawah hak cipta + "Kode sumber terbuka (MIT)".

## 5. Grid, spasi, motion
- Kontainer maks 1200px, padding 24px (mobile 20px). Spasi seksi 96px desktop / 64px mobile.
- Motion: 150ms ease-out untuk hover; mega-menu fade+translateY 4px 180ms; `prefers-reduced-motion` mematikan semua transisi.

## 6. Do / Don't
- ✅ Satu aksen oranye per layar. ✅ Angka selalu `tabular-nums` dan format `id-ID`.
- ❌ Gradien, ilustrasi stok, shadow tebal. ❌ Lebih dari 5 item menu level-1.
