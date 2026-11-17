import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { getPost } from "@/lib/data";
import { renderMarkdown } from "@/lib/markdown";
import { tanggal } from "@/lib/format";

type P = { params: Promise<{ slug: string }> };
const CAT = { BERITA: "Berita", PENGUMUMAN: "Pengumuman", VIDEO: "Video" } as const;

export async function generateMetadata({ params }: P) {
  const post = await getPost((await params).slug);
  return post ? { title: post.title, description: post.excerpt ?? undefined } : {};
}

export default async function Page({ params }: P) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  return (
    <PageShell crumbs={[{ label: "Berita", href: "/berita" }, { label: CAT[post.category] }]} eyebrow={`${CAT[post.category]} · ${tanggal(post.publishedAt)}`} title={post.title}>
      <article className="prose-desa" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
      {post.videoUrl && <a className="btn-primary mt-6" href={post.videoUrl} target="_blank" rel="noopener noreferrer">Tonton video</a>}
    </PageShell>
  );
}
