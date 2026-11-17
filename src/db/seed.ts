/**
 * Seed data Desa Ungasan.
 * Angka APBDes 2026 & kependudukan diambil dari https://ungasan.desa.id (diakses 17 Nov 2026).
 * Jalankan: npm run db:seed  (idempoten — aman diulang)
 */
import { sql } from "drizzle-orm";
import { db, schema as s } from "./index";

const AS_OF = new Date("2026-11-17T08:01:00Z"); // 16:01 WITA

type Group = "PENDAPATAN" | "BELANJA" | "PEMBIAYAAN";
const BUDGET_2026: [Group, string, number, number, boolean?][] = [
  ["PENDAPATAN", "Pendapatan Desa", 33_625_088_618, 19_224_191_621, true],
  ["PENDAPATAN", "Alokasi Dana Desa", 1_246_144_639, 789_447_787],
  ["PENDAPATAN", "Bagi Hasil Pajak dan Retribusi", 28_394_364_601, 16_046_476_715],
  ["PENDAPATAN", "Dana Desa", 373_456_000, 373_456_000],
  ["PENDAPATAN", "Pendapatan Asli Desa", 413_000_000, 344_989_465],
  ["PENDAPATAN", "Bantuan Keuangan Provinsi", 96_000_000, 48_000_000],
  ["PENDAPATAN", "Bantuan Keuangan Kabupaten/Kota", 3_051_086_000, 1_502_553_000],
  ["PENDAPATAN", "Pendapatan Lain-Lain", 51_037_378, 119_268_653],
  ["BELANJA", "Belanja Desa", 38_624_965_245, 15_392_242_804, true],
  ["BELANJA", "Penyelenggaraan Pemerintahan Desa", 13_187_743_195, 7_171_895_326],
  ["BELANJA", "Pelaksanaan Pembangunan Desa", 11_411_726_550, 2_697_271_300],
  ["BELANJA", "Pembinaan Kemasyarakatan Desa", 13_480_473_901, 5_053_270_098],
  ["BELANJA", "Pemberdayaan Masyarakat Desa", 159_015_000, 110_000_000],
  ["BELANJA", "Penanggulangan Bencana, Keadaan Darurat dan Mendesak", 386_006_599, 359_806_080],
  ["PEMBIAYAAN", "Pembiayaan Desa", 4_999_876_627, 4_999_876_627, true],
];

const SERVICES: (typeof s.services.$inferInsert)[] = [
  { slug: "silagas", name: "SiLagas", tagline: "Administrasi desa online", description: "Ajukan surat keterangan, domisili, dan dokumen kependudukan tanpa antre di kantor desa.", url: "https://silagas.id", icon: "FileText", bentoSpan: "xl" },
  { slug: "paduraksa", name: "Paduraksa", tagline: "Pengaduan & aspirasi", description: "Sampaikan keluhan dan aspirasi, lalu pantau tindak lanjutnya.", url: "https://paduraksa.id", icon: "MessageSquareWarning", bentoSpan: "md" },
  { slug: "siandu", name: "SIANDU", tagline: "Posyandu per banjar", description: "Jadwal Posyandu serta layanan ibu dan anak di setiap banjar.", url: "https://ungasan.desa.id", icon: "HeartPulse", bentoSpan: "md" },
  { slug: "dkari", name: "dKari", tagline: "Keuangan desa digital", description: "Digitalisasi anggaran dan realisasi keuangan desa secara terbuka.", url: "https://ungasan.desa.id", icon: "Landmark", bentoSpan: "lg" },
  { slug: "pisah", name: "PISAH", tagline: "Bank sampah", description: "Tabung sampah terpilah dan dapatkan nilai ekonominya.", url: "https://ungasan.desa.id", icon: "Recycle" },
  { slug: "manata", name: "MANATA", tagline: "Peminjaman aset", description: "Pinjam balai, tenda, dan aset desa lainnya.", url: "https://ungasan.desa.id", icon: "Boxes" },
  { slug: "digihub", name: "Ungasan DigiHub", tagline: "Kelas digital", description: "Pelatihan keterampilan digital untuk warga.", url: "https://ungasan.desa.id", icon: "GraduationCap" },
  { slug: "perpustakaan", name: "Sastra Wiguna", tagline: "Perpustakaan digital", description: "Koleksi buku digital desa, gratis untuk warga.", url: "https://ungasan.desa.id", icon: "BookOpen" },
  { slug: "cipta-ungasan-bersih", name: "Cipta Ungasan Bersih", tagline: "Jasa layanan sampah", description: "Langganan pengangkutan sampah rumah tangga dan usaha.", url: "https://ungasan.desa.id", icon: "Truck", status: "INFO", bentoSpan: "lg" },
  { slug: "karpod", name: "Karpod", tagline: "Podcast Karang Taruna", description: "Obrolan anak muda Ungasan di YouTube.", url: "https://www.youtube.com/@desaungasan", icon: "Mic", status: "INFO", bentoSpan: "lg" },
];

const POSTS: { category: "BERITA" | "PENGUMUMAN" | "VIDEO"; slug: string; title: string; date: string; videoUrl?: string }[] = [
  { category: "BERITA", slug: "layanan-pap-smear-dan-kb-keliling-gratis", title: "Layanan Pap Smear dan KB Keliling Gratis", date: "2026-11-17" },
  { category: "BERITA", slug: "ibu-hamil-sehat-bayi-kuat", title: "Ibu Hamil Sehat, Bayi Kuat", date: "2026-11-15" },
  { category: "BERITA", slug: "tumpek-landep-tpst-karisma", title: "Peringati Tumpek Landep, TPST Karisma Desa Ungasan Gelar Pujawali dan Melaspas Bangunan Mess", date: "2026-11-15" },
  { category: "PENGUMUMAN", slug: "hut-17-mangupura", title: "HUT ke-17 Mangupura", date: "2026-11-16" },
  { category: "PENGUMUMAN", slug: "penutupan-jalan-belimbing-sari", title: "Penutupan Jalan Sementara Ruas Jalan Belimbing Sari (arah Ungasan–Pecatu)", date: "2026-11-02" },
  { category: "PENGUMUMAN", slug: "samsat-keliling-november-2026", title: "Jadwal Layanan Samsat Keliling November 2026 Kuta Selatan", date: "2026-10-30" },
  { category: "PENGUMUMAN", slug: "lelang-pengadaan-kendaraan-tpst", title: "Pengumuman Lelang Pengadaan Kendaraan TPST", date: "2026-04-14" },
  { category: "PENGUMUMAN", slug: "lelang-pura-wantilan-kantor-perbekel", title: "Lelang Pembangunan Pura dan Wantilan Kantor Perbekel Ungasan", date: "2026-03-25" },
  { category: "VIDEO", slug: "selayang-pandang-desa-ungasan", title: "Selayang Pandang Desa Ungasan", date: "2026-08-01", videoUrl: "https://www.youtube.com/@desaungasan" },
];

type Sec = "PROFIL" | "PEMERINTAHAN" | "TRANSPARANSI" | "LAYANAN";
const PAGES: { section: Sec; slug: string; title: string; summary: string; body: string; externalUrl?: string }[] = [
  { section: "PROFIL", slug: "sejarah", title: "Sejarah Desa", summary: "Asal-usul nama Ungasan dari Babad Dalem Pemutih.", body: "## Asal-usul\n\nMenurut **Babad Dalem Pemutih**, nama Ungasan dikaitkan dengan peristiwa pelarian Ki Agung Maruti pada tahun 1652.\n\n> Konten lengkap diisi oleh operator desa." },
  { section: "PROFIL", slug: "geografis", title: "Kondisi Geografis", summary: "Letak, batas wilayah, dan topografi.", body: "Desa Ungasan terletak di Kecamatan Kuta Selatan, Kabupaten Badung, Bali." },
  { section: "PROFIL", slug: "peta", title: "Peta Desa", summary: "Peta wilayah dan banjar.", body: "Peta interaktif (OpenStreetMap) dijadwalkan pada fase 2." },
  { section: "PROFIL", slug: "visi-misi", title: "Visi & Misi", summary: "Arah pembangunan desa.", body: "## Visi\n\nDiisi operator desa.\n\n## Misi\n\n1. Diisi operator desa." },
  { section: "PROFIL", slug: "sdgs", title: "SDGs Desa", summary: "Capaian 18 tujuan SDGs Desa.", body: "Data SDGs Desa diisi operator." },
  { section: "PEMERINTAHAN", slug: "sotk", title: "Struktur Organisasi (SOTK)", summary: "Susunan organisasi pemerintah desa.", body: "Bagan SOTK Pemerintah Desa Ungasan." },
  { section: "PEMERINTAHAN", slug: "perangkat", title: "Perangkat & Staf Desa", summary: "Profil perangkat desa.", body: "Daftar perangkat dan staf desa." },
  { section: "PEMERINTAHAN", slug: "tugas-fungsi", title: "Tugas & Fungsi", summary: "Tupoksi perangkat desa.", body: "Tugas dan fungsi pemerintah desa." },
  { section: "PEMERINTAHAN", slug: "lembaga", title: "Lembaga Desa", summary: "BPD, LPM, TP PKK, Karang Taruna, Kader, Satlinmas, KPMD.", body: "- BPD Ungasan\n- LPM\n- TP PKK Desa\n- Karang Taruna\n- Kader Balita, Lansia, Remaja\n- KPMD\n- SATLINMAS" },
  { section: "PEMERINTAHAN", slug: "maklumat", title: "Maklumat Pelayanan", summary: "Janji layanan pemerintah desa.", body: "Maklumat Pelayanan Desa Ungasan." },
  { section: "PEMERINTAHAN", slug: "standar-pelayanan", title: "Standar Pelayanan & SOP", summary: "SPM dan SOP pelayanan desa.", body: "Standar Pelayanan Minimal dan SOP Pelayanan Desa Ungasan." },
  { section: "PEMERINTAHAN", slug: "disiplin-kerja", title: "Disiplin Kerja", summary: "Aturan disiplin perangkat dan staf.", body: "Disiplin kerja perangkat dan staf desa." },
  { section: "PEMERINTAHAN", slug: "produk-hukum", title: "Produk Hukum", summary: "Perdes, Perkades, dan SK.", body: "Produk hukum desa dikelola di SiLagas.", externalUrl: "https://produkhukum.silagas.id" },
  { section: "PEMERINTAHAN", slug: "aset-arsip", title: "Aset & Arsip", summary: "Inventaris aset dan pengarsipan dokumen.", body: "Inventaris Aset Desa 2024–2025, SK pengelola arsip, serta agenda surat masuk/keluar." },
  { section: "PEMERINTAHAN", slug: "pemilihan-perbekel", title: "Pemilihan Perbekel", summary: "Periode 2021–2027.", body: "Informasi Pemilihan Perbekel periode 2021–2027." },
  { section: "PEMERINTAHAN", slug: "bumdesa", title: "BUMDesa Ungasan", summary: "Pembentukan, SOTK, AD/ART, SOP, penyertaan modal.", body: "Informasi BUMDesa Ungasan." },
  { section: "TRANSPARANSI", slug: "perencanaan", title: "Perencanaan", summary: "RPJM 2023–2030 dan RKP 2024–2026.", body: "Dokumen RPJM dan RKP tersedia di halaman Dokumen." },
  { section: "TRANSPARANSI", slug: "pembangunan", title: "Pembangunan", summary: "Kegiatan pembangunan desa.", body: "Daftar kegiatan pembangunan desa." },
  { section: "TRANSPARANSI", slug: "blt-dd", title: "BLT Dana Desa", summary: "Penetapan KPM, perubahan, dan bukti penyaluran.", body: "- SK No. 239/2024 (penetapan)\n- SK No. 116/2025 (perubahan)\n- SK No. 190/2025 (perubahan kedua)\n- Penandaan khusus KPM JPS\n- Bukti penyaluran" },
  { section: "TRANSPARANSI", slug: "ppid", title: "PPID Desa", summary: "Profil, dasar hukum, SOP permohonan informasi.", body: "## Profil PPID\n\n## Dasar Hukum\n\n## SOP Permohonan Informasi Publik\n\n## Informasi Dikecualikan" },
  { section: "LAYANAN", slug: "alur-layanan", title: "Alur Layanan", summary: "Langkah mengurus administrasi.", body: "1. Siapkan KTP & KK\n2. Ajukan di SiLagas atau datang ke kantor desa\n3. Verifikasi oleh petugas\n4. Dokumen diterbitkan" },
  { section: "LAYANAN", slug: "pengaduan", title: "Pengaduan", summary: "SOP pengaduan dan kanal Paduraksa.", body: "Sampaikan pengaduan melalui Paduraksa.", externalUrl: "https://paduraksa.id" },
];

const DOCS: ["APBDES" | "INFOGRAFIS" | "REALISASI" | "LPPDES" | "LKPPDES" | "RPJM" | "RKP" | "BLT_DD", number, string][] = [
  ["APBDES", 2026, "APBDesa 2026"], ["APBDES", 2026, "APBDesa Perubahan 2026"],
  ["APBDES", 2025, "APBDesa 2025"], ["APBDES", 2025, "APBDesa Perubahan 2025"], ["APBDES", 2025, "APBDesa Perubahan Kedua 2025"],
  ["APBDES", 2024, "APBDesa 2024"], ["APBDES", 2024, "APBDesa Perubahan 2024"],
  ["INFOGRAFIS", 2026, "Infografis APBDesa 2026"], ["REALISASI", 2025, "Laporan Realisasi APBDesa 2025"],
  ["LPPDES", 2025, "LPPDes 2025"], ["LKPPDES", 2025, "LKPPDes 2025"], ["RPJM", 2023, "RPJM Desa 2023–2030"],
  ["RKP", 2026, "RKP Desa 2026"], ["BLT_DD", 2025, "SK BLT DD No. 190/2025"],
];

async function main() {
  await db.transaction(async (tx) => {
    // APBDes 2026 (murni)
    await tx.delete(s.budgets).where(sql`${s.budgets.year} = 2026 and ${s.budgets.version} = 'MURNI'`);
    await tx.update(s.budgets).set({ isCurrent: false });
    const [b] = await tx.insert(s.budgets).values({ year: 2026, version: "MURNI", asOf: AS_OF, isCurrent: true }).returning();
    await tx.insert(s.budgetLines).values(
      BUDGET_2026.map(([group, name, planned, realized, isTotal], i) => ({
        budgetId: b.id, group, name, planned, realized, isTotal: Boolean(isTotal), sortOrder: i,
      })),
    );

    // Kependudukan 2026
    await tx.delete(s.populationStats).where(sql`${s.populationStats.year} = 2026`);
    await tx.insert(s.populationStats).values([
      { year: 2026, category: "RINGKASAN", label: "Jumlah Penduduk", male: 8283, female: 8436, total: 16719, asOf: AS_OF, sortOrder: 0 },
      { year: 2026, category: "RINGKASAN", label: "Jumlah KK", total: 4047, asOf: AS_OF, sortOrder: 1 },
      { year: 2026, category: "JENIS_KELAMIN", label: "Laki-laki", male: 8283, total: 8283, asOf: AS_OF, sortOrder: 0 },
      { year: 2026, category: "JENIS_KELAMIN", label: "Perempuan", female: 8436, total: 8436, asOf: AS_OF, sortOrder: 1 },
    ]);

    // Layanan
    for (const [i, sv] of SERVICES.entries()) {
      await tx.insert(s.services).values({ ...sv, sortOrder: i })
        .onConflictDoUpdate({ target: s.services.slug, set: { ...sv, sortOrder: i } });
    }

    // Berita & pengumuman
    for (const p of POSTS) {
      const row = {
        category: p.category, slug: p.slug, title: p.title,
        excerpt: "Konten contoh hasil seed — operator desa mengganti isi ini melalui Admin API.",
        body: `${p.title}.\n\nKonten contoh hasil seed. Perbarui melalui \`PUT /api/v1/berita/${p.slug}\`.`,
        publishedAt: new Date(`${p.date}T09:00:00+08:00`), videoUrl: p.videoUrl ?? null,
      };
      await tx.insert(s.posts).values(row).onConflictDoUpdate({ target: s.posts.slug, set: row });
    }

    // Halaman generik
    for (const [i, p] of PAGES.entries()) {
      await tx.insert(s.pages).values({ ...p, sortOrder: i })
        .onConflictDoUpdate({ target: [s.pages.section, s.pages.slug], set: { ...p, sortOrder: i } });
    }

    // Dokumen
    await tx.delete(s.documents);
    await tx.insert(s.documents).values(DOCS.map(([category, year, title]) => ({ category, year, title, fileUrl: "https://ungasan.desa.id" })));

    await tx.insert(s.siteSettings).values({ key: "moto", value: "Melayani dengan tulus, terbuka untuk semua." })
      .onConflictDoNothing();
  });
  console.log("✔ Seed selesai");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
