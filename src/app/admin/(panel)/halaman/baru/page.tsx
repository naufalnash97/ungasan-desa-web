import { requireAdmin } from "@/lib/session";
import PageHeader from "../../../_ui/PageHeader";
import PageForm from "../PageForm";

export const metadata = { title: "Halaman baru" };
export default async function Page() {
  await requireAdmin();
  return (<><PageHeader title="Halaman baru" back={{ href: "/admin/halaman", label: "Halaman" }} /><PageForm /></>);
}
