/**
 * Navigasi utama — 8 dropdown bertingkat situs lama dirampingkan menjadi 5 mega-menu.
 * Lihat docs/03-AFD.md §2 untuk pemetaan lengkap. (ADR-02: navigasi di kode, konten di DB)
 */
export type NavLink = { label: string; href: string; desc?: string; external?: boolean };
export type NavGroup = { title: string; links: NavLink[] };
export type NavItem = {
  label: string;
  href: string;
  groups: NavGroup[];
  featured: { eyebrow: string; title: string; desc: string; href: string; cta: string };
};

export const NAV: NavItem[] = [
  {
    label: "Profil",
    href: "/profil",
    groups: [
      { title: "Tentang Desa", links: [
        { label: "Sejarah", href: "/profil/sejarah", desc: "Asal-usul nama Ungasan" },
        { label: "Visi & Misi", href: "/profil/visi-misi", desc: "Arah pembangunan desa" },
        { label: "Kondisi Geografis", href: "/profil/geografis", desc: "Letak & batas wilayah" },
        { label: "Peta Desa", href: "/profil/peta", desc: "Wilayah dan banjar" },
      ] },
      { title: "Data Desa", links: [
        { label: "Desa dalam Angka", href: "/profil/statistik", desc: "Penduduk, KK, jenis kelamin" },
        { label: "Pendidikan & Pekerjaan", href: "/profil/statistik#kategori", desc: "Data dalam KK" },
        { label: "Kelompok Umur & Disabilitas", href: "/profil/statistik#kategori" },
        { label: "SDGs Desa", href: "/profil/sdgs", desc: "18 tujuan pembangunan" },
      ] },
    ],
    featured: { eyebrow: "Data 2026", title: "16.719 jiwa", desc: "Lihat statistik kependudukan terbaru Desa Ungasan.", href: "/profil/statistik", cta: "Buka statistik" },
  },
  {
    label: "Pemerintahan",
    href: "/pemerintahan",
    groups: [
      { title: "Organisasi", links: [
        { label: "Struktur Organisasi", href: "/pemerintahan/sotk" },
        { label: "Perangkat & Staf", href: "/pemerintahan/perangkat" },
        { label: "Tugas & Fungsi", href: "/pemerintahan/tugas-fungsi" },
        { label: "Lembaga Desa", href: "/pemerintahan/lembaga", desc: "BPD, LPM, PKK, Karang Taruna" },
      ] },
      { title: "Regulasi & Pelayanan", links: [
        { label: "Produk Hukum", href: "https://produkhukum.silagas.id", external: true },
        { label: "Maklumat Pelayanan", href: "/pemerintahan/maklumat" },
        { label: "Standar Pelayanan & SOP", href: "/pemerintahan/standar-pelayanan" },
        { label: "Disiplin Kerja", href: "/pemerintahan/disiplin-kerja" },
      ] },
      { title: "Lainnya", links: [
        { label: "Aset & Arsip", href: "/pemerintahan/aset-arsip" },
        { label: "Pemilihan Perbekel", href: "/pemerintahan/pemilihan-perbekel" },
        { label: "BUMDesa", href: "/pemerintahan/bumdesa" },
      ] },
    ],
    featured: { eyebrow: "Maklumat", title: "Janji layanan kami", desc: "Standar waktu dan biaya setiap layanan desa.", href: "/pemerintahan/maklumat", cta: "Baca maklumat" },
  },
  {
    label: "Transparansi",
    href: "/transparansi",
    groups: [
      { title: "Keuangan", links: [
        { label: "APBDes", href: "/transparansi/apbdes", desc: "Anggaran & realisasi per tahun" },
        { label: "Laporan & Dokumen", href: "/transparansi/dokumen", desc: "LPPDes, LKPPDes, Infografis" },
      ] },
      { title: "Perencanaan & Program", links: [
        { label: "RPJM & RKP", href: "/transparansi/perencanaan" },
        { label: "Pembangunan", href: "/transparansi/pembangunan" },
        { label: "BLT Dana Desa", href: "/transparansi/blt-dd" },
      ] },
      { title: "Informasi Publik", links: [
        { label: "PPID Desa", href: "/transparansi/ppid", desc: "Permohonan informasi publik" },
      ] },
    ],
    featured: { eyebrow: "APBDes 2026", title: "Realisasi 57% pendapatan", desc: "Pantau anggaran dan realisasi secara terbuka.", href: "/transparansi/apbdes", cta: "Lihat APBDes" },
  },
  {
    label: "Layanan",
    href: "/layanan",
    groups: [
      { title: "Administrasi", links: [
        { label: "SiLagas", href: "https://silagas.id", desc: "Surat & administrasi online", external: true },
        { label: "Alur Layanan", href: "/layanan/alur-layanan" },
        { label: "Buku Tamu", href: "/layanan/buku-tamu" },
      ] },
      { title: "Pengaduan", links: [
        { label: "Paduraksa", href: "https://paduraksa.id", desc: "Kanal pengaduan & aspirasi", external: true },
        { label: "SOP Pengaduan", href: "/layanan/pengaduan" },
      ] },
      { title: "Platform Desa", links: [
        { label: "Semua layanan digital", href: "/layanan", desc: "SIANDU, PISAH, MANATA, dKari, DigiHub" },
      ] },
    ],
    featured: { eyebrow: "Online 24 jam", title: "Urus surat tanpa antre", desc: "Ajukan surat keterangan langsung dari HP.", href: "https://silagas.id", cta: "Buka SiLagas" },
  },
  {
    label: "Berita",
    href: "/berita",
    groups: [
      { title: "Informasi", links: [
        { label: "Berita Desa", href: "/berita?kategori=BERITA" },
        { label: "Pengumuman & Lelang", href: "/berita?kategori=PENGUMUMAN" },
        { label: "Video & Karpod", href: "/berita?kategori=VIDEO" },
      ] },
    ],
    featured: { eyebrow: "Terbaru", title: "Kabar dari Ungasan", desc: "Kegiatan, pengumuman, dan agenda desa.", href: "/berita", cta: "Semua berita" },
  },
];

export const CONTACT = {
  address: "Jl. Pura Batu Pageh No. 578, Ungasan, Kuta Selatan, Badung, Bali",
  phone: "0361-4467350",
  instagram: "https://instagram.com/humasungasan",
  youtube: "https://www.youtube.com/@desaungasan",
  facebook: "https://facebook.com",
};
