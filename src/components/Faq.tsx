import { Plus } from "lucide-react";

const FAQ = [
  { q: "Bagaimana cara mengurus surat keterangan?", a: "Ajukan secara online melalui SiLagas atau datang ke Kantor Perbekel Ungasan pada jam kerja dengan membawa KTP dan KK." },
  { q: "Di mana saya bisa melihat laporan keuangan desa?", a: "Buka menu Transparansi → APBDes untuk ringkasan anggaran dan realisasi, atau Transparansi → Laporan & Dokumen untuk mengunduh LPPDes, LKPPDes, dan infografis." },
  { q: "Bagaimana menyampaikan pengaduan?", a: "Gunakan kanal Paduraksa. Pengaduan dicatat, diberi nomor, dan tindak lanjutnya dapat dipantau." },
  { q: "Bagaimana mengajukan permohonan informasi publik?", a: "Ikuti SOP Permohonan Informasi Publik di halaman PPID Desa." },
];

export default function Faq() {
  return (
    <div className="divide-y divide-line border-y border-line">
      {FAQ.map(({ q, a }) => (
        <details key={q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[1.0625rem] font-medium [&::-webkit-details-marker]:hidden">
            {q}
            <Plus aria-hidden className="size-4 shrink-0 text-muted transition-transform group-open:rotate-45" />
          </summary>
          <p className="mt-3 max-w-[62ch] text-muted">{a}</p>
        </details>
      ))}
    </div>
  );
}
