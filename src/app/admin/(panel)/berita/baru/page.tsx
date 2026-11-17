import { requireAdmin } from "@/lib/session";
import PageHeader from "../../../_ui/PageHeader";
import PostForm from "../PostForm";

export const metadata = { title: "Tulis berita" };

export default async function Page({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  await requireAdmin();
  const { kategori } = await searchParams;
  return (
    <>
      <PageHeader title="Tulis baru" back={{ href: "/admin/berita", label: "Berita & Pengumuman" }} />
      <PostForm defaultCategory={["BERITA", "PENGUMUMAN", "VIDEO"].includes(kategori ?? "") ? kategori : "BERITA"} />
    </>
  );
}
