# 01 — PRD · Product Requirement Document

> **Pemilik:** 🧭 Product Manager (`product-manager.md`) · **Reviewer:** Senior Project Manager
> **Status:** v1.0 · 17 Nov 2026 · **Referensi:** https://ungasan.desa.id

## 1. Press release (ditulis sebelum PRD)

> **Desa Ungasan meluncurkan website baru yang bisa dipahami dalam 10 detik.** Warga kini menemukan layanan surat, jadwal Posyandu, pengumuman lelang, dan realisasi APBDes dari satu beranda — tanpa menelusuri delapan menu bertingkat. Semua angka keuangan ditampilkan dalam bentuk ringkasan visual dan dokumen aslinya tetap bisa diunduh.

## 2. Masalah

Hasil audit situs lama (ungasan.desa.id, diakses 17 Nov 2026):

| # | Temuan | Dampak ke warga |
|---|---|---|
| P1 | **10 item menu utama**, 8 di antaranya dropdown hingga **4 level** (mis. Pemerintahan → Aset Desa → Pengarsipan Dokumen → SK Pengelola Arsip → 2025) | Warga tidak menemukan dokumen; navigasi mobile nyaris mustahil |
| P2 | 10+ platform digital (SiLagas, Paduraksa, PISAH, MANATA, SIANDU, dKari, DigiHub, dll.) tampil sebagai daftar logo tanpa konteks | Warga tidak tahu layanan mana untuk kebutuhan apa |
| P3 | APBDes ditampilkan sebagai tabel panjang angka rupiah | Sulit membaca proporsi realisasi vs anggaran |
| P4 | Konten kontradiktif ("belum ada pengumuman" di samping 7 pengumuman) | Menurunkan kepercayaan |
| P5 | Dokumen per tahun tersebar di menu (APBDes 2024/2025/2026, Perubahan, Perubahan Kedua) | Tidak ada satu tempat untuk arsip transparansi |

## 3. Tujuan & metrik keberhasilan

| Tujuan | Metrik | Target 3 bulan |
|---|---|---|
| Navigasi ringkas | Item menu level-1 | **5** (dari 10); kedalaman maks **2 level** di mega-menu |
| Layanan mudah ditemukan | Klik dari beranda ke layanan tujuan | ≤ 2 klik |
| Transparansi terbaca | Waktu memahami % realisasi APBDes (uji 5 warga) | < 15 detik |
| Performa | Lighthouse mobile (Performance / A11y) | ≥ 90 / ≥ 95 |
| Partisipasi | Entri Buku Tamu / bulan | baseline +30% |

## 4. Persona

1. **Bu Made (42, pedagang, HP Android)** — butuh surat keterangan usaha dan jadwal Posyandu banjar.
2. **Pak Ketut (55, anggota BPD)** — memantau realisasi APBDes dan mengunduh LPPDes.
3. **Rina (24, Karang Taruna)** — membaca berita, menonton Karpod, ikut kelas DigiHub.
4. **Operator desa (admin)** — mempublikasikan berita, pengumuman, dokumen, dan memperbarui angka APBDes.
5. **Jurnalis / peneliti** — mencari data kependudukan & dokumen PPID.

## 5. Ruang lingkup

### 5.1 Arsitektur informasi baru (8 → 5 menu)

| Menu baru | Isi (dirampingkan dari menu lama) |
|---|---|
| **Profil** | Sejarah, Geografis, Peta, Visi & Misi, Moto · *Data Desa*: Statistik Penduduk, Pendidikan, Pekerjaan, Agama, Kelompok Umur, Disabilitas, Stunting, SDGs |
| **Pemerintahan** | SOTK, Perangkat & Staf, Tugas & Fungsi, Lembaga Desa (BPD, LPM, PKK, Karang Taruna, Kader, Satlinmas, KPMD) · *Regulasi*: Produk Hukum, Maklumat, Standar Pelayanan & SOP, Disiplin Kerja · *Lainnya*: Aset & Arsip, Pemilihan Perbekel, BUMDesa |
| **Transparansi** | APBDes (semua tahun & perubahan dalam satu halaman ber-filter), Infografis, Laporan Realisasi, LPPDes, LKPPDes, LPPD AMJ · *Perencanaan*: RPJM, RKP · Pembangunan · BLT DD · PPID |
| **Layanan** | Bento Akses Layanan: SiLagas, Alur Layanan, Pengaduan (Paduraksa + SOP), SIANDU, PISAH, MANATA, dKari, DigiHub, Perpustakaan Sastra Wiguna, Cipta Ungasan Bersih, Lapak BUMDesa, Buku Tamu |
| **Berita** | Berita, Pengumuman (termasuk lelang), Video, Karpod |

Tombol kanan header: **Hubungi Kami** (primer) + ikon pencarian.

### 5.2 Fitur — MoSCoW

| ID | Fitur | Prioritas |
|---|---|---|
| F1 | Mega-menu 5 kolom, keyboard & screen-reader friendly, drawer di mobile | Must |
| F2 | Hero editorial (gaya Papermark) + strip konversi "Butuh surat? → SiLagas" | Must |
| F3 | Bento **Akses Layanan** (gaya Context Engine / Sponkly) | Must |
| F4 | **Desa dalam Angka** — KPI penduduk (gaya Basedash) | Must |
| F5 | **APBDes** — KPI pendapatan/belanja/pembiayaan + rincian dengan bar progres, filter tahun & versi | Must |
| F6 | Berita & Pengumuman (list, detail, kategori) | Must |
| F7 | Halaman konten generik (profil, pemerintahan, PPID) dari database | Must |
| F8 | Arsip dokumen (PDF) per kategori & tahun | Should |
| F9 | Buku Tamu (form → DB, anti-spam) | Should |
| F10 | REST API publik `/api/v1` (open data) | Should |
| F11 | Admin API berbasis token untuk berita/pengumuman | Should |
| F12 | Pencarian situs | Could |
| F13 | Panel admin (CMS) visual | Won't (v1) → fase 2 |
| F14 | Multi-bahasa (EN/Bali) | Won't (v1) |

## 6. Non-goals
- Tidak menggantikan SiLagas/Paduraksa — website menjadi **pintu masuk**, bukan sistem layanan.
- Tidak menyimpan data pribadi warga (NIK/KK). Buku tamu hanya nama, asal, keperluan, pesan.

## 7. Asumsi & risiko
| Risiko | Mitigasi |
|---|---|
| Data APBDes diperbarui manual | Seed + endpoint admin; fase 2 integrasi dKari |
| Operator belum terbiasa API | Fase 2: Payload CMS (open-source) di atas skema yang sama |
| Hosting desa terbatas | Satu container Node + PostgreSQL, bisa jalan di VPS 1 vCPU/1 GB |

## 8. Kriteria rilis (Definition of Done)
- Semua item **Must** terpenuhi, build hijau di CI, seed tampil di beranda.
- Lighthouse a11y ≥ 95, navigasi penuh dengan keyboard.
- Review lulus dari Code Reviewer & Reality Checker.
