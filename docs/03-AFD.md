# 03 — AFD · App Flow Document

> **Pemilik:** UX Architect (`design-ux-architect.md`) · **Reviewer:** Accessibility Auditor

## 1. Sitemap (maks. 2 level)

```
/                                   Beranda
├── /profil                         Profil (index kartu)
│   ├── /profil/sejarah
│   ├── /profil/geografis
│   ├── /profil/peta
│   ├── /profil/visi-misi
│   ├── /profil/statistik           Desa dalam Angka (semua kategori)
│   └── /profil/sdgs
├── /pemerintahan
│   ├── /pemerintahan/sotk
│   ├── /pemerintahan/perangkat
│   ├── /pemerintahan/lembaga
│   ├── /pemerintahan/maklumat
│   ├── /pemerintahan/standar-pelayanan
│   ├── /pemerintahan/produk-hukum  (→ produkhukum.silagas.id)
│   ├── /pemerintahan/aset-arsip
│   └── /pemerintahan/bumdesa
├── /transparansi
│   ├── /transparansi/apbdes?tahun=2026&versi=MURNI
│   ├── /transparansi/dokumen?kategori=LPPDES&tahun=2025
│   ├── /transparansi/perencanaan
│   ├── /transparansi/pembangunan
│   ├── /transparansi/blt-dd
│   └── /transparansi/ppid
├── /layanan                        Bento semua layanan
│   ├── /layanan/alur-layanan
│   ├── /layanan/pengaduan
│   └── /layanan/buku-tamu          Form
├── /berita                         ?kategori=BERITA|PENGUMUMAN|VIDEO
│   └── /berita/[slug]
└── /hubungi-kami
```

## 2. Pemetaan menu lama → baru (ringkas)

| Menu lama (level) | Lokasi baru |
|---|---|
| Profil Desa (2) | Profil → Tentang Desa |
| Pemerintahan (≤4) | Pemerintahan → 3 kolom (Organisasi, Regulasi, Aset & Lainnya) |
| Perencanaan (3) | Transparansi → Perencanaan |
| APBDesa (4) | Transparansi → APBDes (1 halaman, filter tahun/versi) + Dokumen |
| Pembangunan (1) | Transparansi → Pembangunan |
| Data Desa (3) | Profil → Data Desa (tab kategori di /profil/statistik) |
| PPID (2) | Transparansi → PPID |
| BUMDesa (2) | Pemerintahan → Lainnya; Lapak → Layanan |
| Buku Tamu (1) | Layanan → Buku Tamu + tautan footer |

**Prinsip:** level 3–4 lama (tahun, versi perubahan, nomor SK) **diubah dari menu menjadi filter** di halaman tujuan.

## 3. Flow utama

### Flow A — Warga mengurus surat (Bu Made)
```
Beranda ─▶ Hero CTA "Ajukan Layanan"  ─┐
        └▶ Bento "SiLagas" ─────────────┼─▶ (tab baru) silagas.id
                                       │
        └▶ Mega-menu Layanan → Alur ───▶ /layanan/alur-layanan ─▶ CTA SiLagas
```
Target: ≤ 2 klik. Tautan eksternal diberi ikon ↗ dan `rel="noopener"`.

### Flow B — Memantau APBDes (Pak Ketut)
```
Beranda ─▶ Seksi APBDes (KPI 3 kartu) ─▶ "Lihat rincian" ─▶ /transparansi/apbdes
   /transparansi/apbdes:
     [Tahun ▾ 2026] [Versi ▾ Murni | Perubahan | Perubahan Kedua]
     ├─ KPI Pendapatan / Belanja / Pembiayaan (realisasi vs anggaran, %)
     ├─ Tabel rincian + bar progres
     └─ Dokumen terkait (PDF) ─▶ unduh
```
State: kosong (tahun tanpa data) → pesan "Data belum dipublikasikan" + tautan dokumen.

### Flow C — Membaca pengumuman lelang
```
Beranda ─▶ Kolom Pengumuman ─▶ /berita/[slug]
Mega-menu Berita ─▶ Pengumuman ─▶ /berita?kategori=PENGUMUMAN ─▶ detail
```

### Flow D — Mengisi Buku Tamu
```
/layanan/buku-tamu
  form: nama*, asal/instansi*, keperluan*, pesan (≤1000), [hp honeypot tersembunyi]
  ─submit─▶ POST /api/v1/buku-tamu
     ├─ 201 → pesan sukses, form reset
     ├─ 422 → error per-field (aria-describedby)
     └─ 429 → "Terlalu banyak percobaan, coba 1 menit lagi"
```

### Flow E — Operator memublikasikan berita (admin API)
```
curl -X POST /api/v1/berita -H "Authorization: Bearer $ADMIN_API_TOKEN" -d '{...}'
  ├─ 401 token salah   ├─ 422 validasi   └─ 201 → tampil di beranda (dinamis)
```

## 4. Interaksi mega-menu
| Input | Perilaku |
|---|---|
| Hover / klik item level-1 | Panel terbuka, `aria-expanded="true"` |
| `Tab` | Bergerak ke tautan di panel |
| `Esc` | Tutup panel, fokus kembali ke tombol pemicu |
| Klik di luar | Tutup |
| Mobile (< 1024px) | Tombol ☰ → drawer full-screen, menu level-1 menjadi akordion |

## 5. Struktur beranda (urutan seksi)
1. Announcement bar (pengumuman terbaru)
2. Header + mega-menu
3. Hero editorial (Papermark)
4. Strip konversi (sticky di bawah hero)
5. **Akses Layanan** — bento
6. **Desa dalam Angka** — KPI penduduk
7. **APBDes** — KPI + rincian
8. Berita & Pengumuman (2 kolom)
9. FAQ akordion
10. CTA band oranye — Pengaduan
11. Footer multi-kolom
