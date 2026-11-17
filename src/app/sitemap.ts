import type { MetadataRoute } from "next";
import { getPagesBySection, getPosts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const fixed = ["", "/profil", "/profil/statistik", "/pemerintahan", "/transparansi", "/transparansi/apbdes", "/transparansi/dokumen", "/layanan", "/layanan/buku-tamu", "/berita", "/hubungi-kami"];
  const sections = [["PROFIL", "profil"], ["PEMERINTAHAN", "pemerintahan"], ["TRANSPARANSI", "transparansi"], ["LAYANAN", "layanan"]] as const;
  const pages = (await Promise.all(sections.map(async ([s, path]) => (await getPagesBySection(s)).filter((p) => !p.externalUrl).map((p) => `/${path}/${p.slug}`)))).flat();
  const posts = (await getPosts({ limit: 50 })).map((p) => `/berita/${p.slug}`);
  return [...fixed, ...pages, ...posts].map((u) => ({ url: `${base}${u}` }));
}
