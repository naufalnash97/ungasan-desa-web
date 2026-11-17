import Link from "next/link";
import { tanggal } from "@/lib/format";
import type { getPosts } from "@/lib/data";

type Post = Awaited<ReturnType<typeof getPosts>>[number];

export function PostItem({ p, compact }: { p: Post; compact?: boolean }) {
  return (
    <li>
      <Link href={`/berita/${p.slug}`} className="group block py-4">
        <p className="text-[12px] text-muted"><time dateTime={new Date(p.publishedAt).toISOString()}>{tanggal(p.publishedAt)}</time></p>
        <p className={`mt-1 font-medium leading-snug text-ink group-hover:underline group-hover:underline-offset-4 ${compact ? "text-[14.5px]" : "text-[1.0625rem]"}`}>{p.title}</p>
        {!compact && p.excerpt && <p className="mt-1 line-clamp-2 text-[13.5px] text-muted">{p.excerpt}</p>}
      </Link>
    </li>
  );
}

export default function NewsSection({ berita, pengumuman }: { berita: Post[]; pengumuman: Post[] }) {
  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div className="flex items-baseline justify-between border-b border-ink pb-3">
          <h3 className="text-lg font-semibold">Berita terbaru</h3>
          <Link href="/berita?kategori=BERITA" className="text-sm text-muted hover:text-ink">Semua →</Link>
        </div>
        <ul className="divide-y divide-line">{berita.map((p) => <PostItem key={p.slug} p={p} />)}</ul>
      </div>
      <div className="lg:col-span-5">
        <div className="flex items-baseline justify-between border-b border-ink pb-3">
          <h3 className="text-lg font-semibold">Pengumuman</h3>
          <Link href="/berita?kategori=PENGUMUMAN" className="text-sm text-muted hover:text-ink">Semua →</Link>
        </div>
        {pengumuman.length ? (
          <ul className="divide-y divide-line">{pengumuman.map((p) => <PostItem key={p.slug} p={p} compact />)}</ul>
        ) : (
          <p className="py-6 text-sm text-muted">Belum ada pengumuman.</p>
        )}
      </div>
    </div>
  );
}
