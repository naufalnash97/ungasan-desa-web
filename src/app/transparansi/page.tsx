import { SectionIndex } from "../_section/SectionViews";
export const metadata = { title: "Transparansi" };
export default function Page() {
  return <SectionIndex section="TRANSPARANSI" extra={[
    { title: "APBDes", summary: "Anggaran dan realisasi per tahun & versi perubahan.", href: "/transparansi/apbdes" },
    { title: "Laporan & Dokumen", summary: "APBDes, LPPDes, LKPPDes, RPJM, RKP, BLT DD.", href: "/transparansi/dokumen" },
  ]} />;
}
