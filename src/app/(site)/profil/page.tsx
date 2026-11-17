import { SectionIndex } from "../_section/SectionViews";
export const metadata = { title: "Profil" };
export default function Page() {
  return <SectionIndex section="PROFIL" extra={[{ title: "Desa dalam Angka", summary: "Statistik penduduk, KK, dan jenis kelamin.", href: "/profil/statistik" }]} />;
}
