/** Lapisan akses data — dipakai Server Components DAN Route Handlers (satu sumber kebenaran). */
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db, schema as s } from "@/db";

export type Section = (typeof s.sectionEnum.enumValues)[number];
export type PostCategory = (typeof s.postCategoryEnum.enumValues)[number];
export type BudgetVersion = (typeof s.budgetVersionEnum.enumValues)[number];

export async function getPosts(opts: { category?: PostCategory; limit?: number; offset?: number } = {}) {
  const where = and(eq(s.posts.published, true), opts.category ? eq(s.posts.category, opts.category) : undefined);
  return db.select({
    slug: s.posts.slug, title: s.posts.title, excerpt: s.posts.excerpt, category: s.posts.category,
    coverUrl: s.posts.coverUrl, videoUrl: s.posts.videoUrl, publishedAt: s.posts.publishedAt,
  }).from(s.posts).where(where).orderBy(desc(s.posts.publishedAt))
    .limit(Math.min(opts.limit ?? 12, 50)).offset(opts.offset ?? 0);
}

export async function getPost(slug: string) {
  const [p] = await db.select().from(s.posts).where(and(eq(s.posts.slug, slug), eq(s.posts.published, true))).limit(1);
  return p ?? null;
}

export async function getPage(section: Section, slug: string) {
  const [p] = await db.select().from(s.pages)
    .where(and(eq(s.pages.section, section), eq(s.pages.slug, slug), eq(s.pages.published, true))).limit(1);
  return p ?? null;
}

export async function getPagesBySection(section: Section) {
  return db.select({ slug: s.pages.slug, title: s.pages.title, summary: s.pages.summary, externalUrl: s.pages.externalUrl })
    .from(s.pages).where(and(eq(s.pages.section, section), eq(s.pages.published, true))).orderBy(asc(s.pages.sortOrder));
}

export async function getServices() {
  return db.select().from(s.services).where(eq(s.services.active, true)).orderBy(asc(s.services.sortOrder));
}

export async function getPopulation(year?: number) {
  const y = year ?? (await db.select({ y: sql<number>`max(${s.populationStats.year})` }).from(s.populationStats))[0]?.y;
  if (!y) return null;
  const rows = await db.select().from(s.populationStats).where(eq(s.populationStats.year, y))
    .orderBy(asc(s.populationStats.category), asc(s.populationStats.sortOrder));
  const total = rows.find((r) => r.category === "RINGKASAN" && r.label === "Jumlah Penduduk");
  const kk = rows.find((r) => r.category === "RINGKASAN" && r.label === "Jumlah KK");
  return {
    year: y,
    asOf: rows[0]?.asOf ?? null,
    penduduk: total?.total ?? 0,
    laki: total?.male ?? 0,
    perempuan: total?.female ?? 0,
    kk: kk?.total ?? 0,
    rataPerKk: kk?.total ? (total?.total ?? 0) / kk.total : 0,
    rows,
  };
}

/** APBDes. Tanpa argumen → versi `isCurrent`. */
export async function getBudget(year?: number, version: BudgetVersion = "MURNI") {
  const budget = await db.query.budgets.findFirst({
    where: year ? and(eq(s.budgets.year, year), eq(s.budgets.version, version)) : eq(s.budgets.isCurrent, true),
    with: { lines: { orderBy: [asc(s.budgetLines.sortOrder)] } },
  });
  if (!budget) return null;
  const group = (g: "PENDAPATAN" | "BELANJA" | "PEMBIAYAAN") => {
    const lines = budget.lines.filter((l) => l.group === g);
    return { total: lines.find((l) => l.isTotal) ?? null, items: lines.filter((l) => !l.isTotal) };
  };
  return {
    year: budget.year, version: budget.version, asOf: budget.asOf,
    pendapatan: group("PENDAPATAN"), belanja: group("BELANJA"), pembiayaan: group("PEMBIAYAAN"),
  };
}

export async function getBudgetIndex() {
  return db.select({ year: s.budgets.year, version: s.budgets.version, isCurrent: s.budgets.isCurrent })
    .from(s.budgets).orderBy(desc(s.budgets.year), asc(s.budgets.version));
}

export async function getDocuments(opts: { category?: (typeof s.documentCategoryEnum.enumValues)[number]; year?: number } = {}) {
  return db.select().from(s.documents)
    .where(and(opts.category ? eq(s.documents.category, opts.category) : undefined, opts.year ? eq(s.documents.year, opts.year) : undefined))
    .orderBy(desc(s.documents.year), asc(s.documents.title));
}
