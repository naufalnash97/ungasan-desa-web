import Link from "next/link";
import { getPosts } from "@/lib/data";
import MegaMenu from "./MegaMenu";

export default async function SiteHeader() {
  const [latest] = await getPosts({ category: "PENGUMUMAN", limit: 1 });
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <a href="#konten" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Lewati ke konten
      </a>
      {latest && (
        <div className="bg-ink text-white">
          <div className="container-x flex h-8 items-center justify-center gap-2 text-[12.5px]">
            <span className="rounded-full bg-accent px-2 py-px text-[10.5px] font-semibold uppercase tracking-wide text-ink">Pengumuman</span>
            <Link href={`/berita/${latest.slug}`} className="truncate hover:underline">{latest.title} →</Link>
          </div>
        </div>
      )}
      <div className="border-b border-line"><MegaMenu /></div>
    </header>
  );
}
