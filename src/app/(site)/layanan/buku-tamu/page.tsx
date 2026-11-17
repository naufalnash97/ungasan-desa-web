import PageShell from "@/components/PageShell";
import GuestbookForm from "./GuestbookForm";

export const metadata = { title: "Buku Tamu" };

export default function Page() {
  return (
    <PageShell crumbs={[{ label: "Layanan", href: "/layanan" }, { label: "Buku Tamu" }]} eyebrow="Layanan" title="Buku Tamu"
      summary="Catat kunjungan Anda ke Kantor Perbekel Ungasan. Kami tidak meminta NIK atau nomor KK.">
      <GuestbookForm />
    </PageShell>
  );
}
