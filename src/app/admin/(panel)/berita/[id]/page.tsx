import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireAdmin } from "@/lib/session";
import PageHeader from "../../../_ui/PageHeader";
import ConfirmButton from "../../../_ui/ConfirmButton";
import PostForm from "../PostForm";
import { deletePost } from "../actions";

export const metadata = { title: "Ubah berita" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [post] = await db.select().from(s.posts).where(eq(s.posts.id, id)).limit(1);
  if (!post) notFound();
  return (
    <>
      <PageHeader title="Ubah berita" desc={post.title} back={{ href: "/admin/berita", label: "Berita & Pengumuman" }} />
      <PostForm post={post} />
      <form action={deletePost.bind(null, post.id)} className="mt-10 border-t border-line pt-6">
        <ConfirmButton label="Hapus berita ini" message={`Hapus "${post.title}"?`} />
      </form>
    </>
  );
}
