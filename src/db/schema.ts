/**
 * Skema database Website Desa Ungasan (Drizzle ORM + PostgreSQL)
 * Pemilik: Backend Architect + Database Optimizer — lihat docs/05-BSD.md
 */
import {
  pgTable, pgEnum, text, integer, bigint, boolean, timestamp, uniqueIndex, index, serial,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

const ts = (name: string) => timestamp(name, { withTimezone: true }).notNull().defaultNow();

// ─────────────── Enum ───────────────
export const sectionEnum = pgEnum("section", ["PROFIL", "PEMERINTAHAN", "TRANSPARANSI", "LAYANAN"]);
export const postCategoryEnum = pgEnum("post_category", ["BERITA", "PENGUMUMAN", "VIDEO"]);
export const documentCategoryEnum = pgEnum("document_category", [
  "APBDES", "INFOGRAFIS", "REALISASI", "LPPDES", "LKPPDES", "LPPD_AMJ", "RPJM", "RKP",
  "BLT_DD", "PPID", "PRODUK_HUKUM", "ASET", "ARSIP", "BUMDES", "LAINNYA",
]);
export const budgetVersionEnum = pgEnum("budget_version", ["MURNI", "PERUBAHAN", "PERUBAHAN_KEDUA"]);
export const budgetGroupEnum = pgEnum("budget_group", ["PENDAPATAN", "BELANJA", "PEMBIAYAAN"]);
export const serviceStatusEnum = pgEnum("service_status", ["ONLINE", "INFO"]);
export const bentoSpanEnum = pgEnum("bento_span", ["xl", "lg", "md", "sm"]);

// ─────────────── Konten ───────────────
/** Halaman konten generik (Sejarah, Visi Misi, SOTK, PPID, ...) */
export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  section: sectionEnum("section").notNull(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  summary: text("summary"),
  body: text("body").notNull(), // Markdown — disanitasi saat render
  externalUrl: text("external_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
}, (t) => [uniqueIndex("pages_section_slug_uq").on(t.section, t.slug)]);

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  category: postCategoryEnum("category").notNull(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  body: text("body").notNull(),
  coverUrl: text("cover_url"),
  videoUrl: text("video_url"),
  publishedAt: ts("published_at"),
  published: boolean("published").notNull().default(true),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
}, (t) => [
  index("posts_feed_idx").on(t.category, t.published, t.publishedAt.desc()),
  // Full-text search (fase 2 F12) — konfigurasi 'simple' cocok untuk Bahasa Indonesia
  index("posts_fts_idx").using("gin", sql`to_tsvector('simple', ${t.title} || ' ' || ${t.body})`),
]);

// ─────────────── Transparansi ───────────────
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  category: documentCategoryEnum("category").notNull(),
  year: integer("year"),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  publishedAt: ts("published_at"),
}, (t) => [index("documents_cat_year_idx").on(t.category, t.year)]);

/** Satu dokumen APBDes = tahun + versi perubahan */
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  version: budgetVersionEnum("version").notNull().default("MURNI"),
  asOf: timestamp("as_of", { withTimezone: true }).notNull(),
  isCurrent: boolean("is_current").notNull().default(false),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
}, (t) => [
  uniqueIndex("budgets_year_version_uq").on(t.year, t.version),
  // hanya boleh ada SATU versi yang tampil di beranda
  uniqueIndex("budgets_one_current_uq").on(t.isCurrent).where(sql`${t.isCurrent} = true`),
]);

/** Rincian APBDes. Rupiah penuh sebagai BIGINT (tanpa floating point). isTotal = baris total kelompok. */
export const budgetLines = pgTable("budget_lines", {
  id: serial("id").primaryKey(),
  budgetId: integer("budget_id").notNull().references(() => budgets.id, { onDelete: "cascade" }),
  group: budgetGroupEnum("group").notNull(),
  name: text("name").notNull(),
  isTotal: boolean("is_total").notNull().default(false),
  planned: bigint("planned", { mode: "number" }).notNull(),   // anggaran (aman < 9e15)
  realized: bigint("realized", { mode: "number" }).notNull(), // realisasi
  sortOrder: integer("sort_order").notNull().default(0),
}, (t) => [index("budget_lines_budget_group_idx").on(t.budgetId, t.group)]);

export const budgetsRelations = relations(budgets, ({ many }) => ({ lines: many(budgetLines) }));
export const budgetLinesRelations = relations(budgetLines, ({ one }) => ({
  budget: one(budgets, { fields: [budgetLines.budgetId], references: [budgets.id] }),
}));

/** Statistik kependudukan: RINGKASAN, JENIS_KELAMIN, PENDIDIKAN, PEKERJAAN, AGAMA, UMUR, DISABILITAS, BANJAR */
export const populationStats = pgTable("population_stats", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  category: text("category").notNull(),
  label: text("label").notNull(),
  male: integer("male").notNull().default(0),
  female: integer("female").notNull().default(0),
  total: integer("total").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  asOf: timestamp("as_of", { withTimezone: true }).notNull(),
}, (t) => [uniqueIndex("population_year_cat_label_uq").on(t.year, t.category, t.label)]);

// ─────────────── Layanan & lainnya ───────────────
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(),
  icon: text("icon").notNull(), // nama ikon lucide
  status: serviceStatusEnum("status").notNull().default("ONLINE"),
  bentoSpan: bentoSpanEnum("bento_span").notNull().default("sm"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const officials = pgTable("officials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  unit: text("unit").notNull().default("Pemerintah Desa"),
  photoUrl: text("photo_url"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const guestbookEntries = pgTable("guestbook_entries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  origin: text("origin").notNull(),
  purpose: text("purpose").notNull(),
  message: text("message"),
  ipHash: text("ip_hash").notNull(), // SHA-256(ip + salt) — tidak menyimpan IP mentah
  approved: boolean("approved").notNull().default(false),
  createdAt: ts("created_at"),
}, (t) => [index("guestbook_created_idx").on(t.createdAt.desc())]);

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// ─────────────── Panel admin ───────────────
export const adminRoleEnum = pgEnum("admin_role", ["ADMIN", "EDITOR"]);

/** Operator panel admin. ADMIN = semua akses termasuk kelola pengguna; EDITOR = konten saja. */
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(), // scrypt: salt$hash (hex)
  role: adminRoleEnum("role").notNull().default("EDITOR"),
  active: boolean("active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: ts("created_at"),
});

/** Sesi login. Yang disimpan hanya SHA-256 dari token cookie — token mentah tidak pernah masuk DB. */
export const adminSessions = pgTable("admin_sessions", {
  id: text("id").primaryKey(), // sha256(token)
  userId: integer("user_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: ts("created_at"),
}, (t) => [index("admin_sessions_user_idx").on(t.userId)]);

/** Jejak audit setiap perubahan dari panel admin (akuntabilitas pemerintah desa). */
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => adminUsers.id, { onDelete: "set null" }),
  action: text("action").notNull(), // CREATE | UPDATE | DELETE | LOGIN | LOGOUT | UPLOAD
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  summary: text("summary"),
  createdAt: ts("created_at"),
}, (t) => [index("audit_logs_created_idx").on(t.createdAt.desc())]);
