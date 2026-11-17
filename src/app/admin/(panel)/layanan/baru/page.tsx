import { requireAdmin } from "@/lib/session";
import PageHeader from "../../../_ui/PageHeader";
import ServiceForm from "../ServiceForm";

export const metadata = { title: "Layanan baru" };
export default async function Page() {
  await requireAdmin();
  return (<><PageHeader title="Layanan baru" back={{ href: "/admin/layanan", label: "Layanan" }} /><ServiceForm /></>);
}
