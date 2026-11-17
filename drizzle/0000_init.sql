CREATE TYPE "public"."bento_span" AS ENUM('xl', 'lg', 'md', 'sm');--> statement-breakpoint
CREATE TYPE "public"."budget_group" AS ENUM('PENDAPATAN', 'BELANJA', 'PEMBIAYAAN');--> statement-breakpoint
CREATE TYPE "public"."budget_version" AS ENUM('MURNI', 'PERUBAHAN', 'PERUBAHAN_KEDUA');--> statement-breakpoint
CREATE TYPE "public"."document_category" AS ENUM('APBDES', 'INFOGRAFIS', 'REALISASI', 'LPPDES', 'LKPPDES', 'LPPD_AMJ', 'RPJM', 'RKP', 'BLT_DD', 'PPID', 'PRODUK_HUKUM', 'ASET', 'ARSIP', 'BUMDES', 'LAINNYA');--> statement-breakpoint
CREATE TYPE "public"."post_category" AS ENUM('BERITA', 'PENGUMUMAN', 'VIDEO');--> statement-breakpoint
CREATE TYPE "public"."section" AS ENUM('PROFIL', 'PEMERINTAHAN', 'TRANSPARANSI', 'LAYANAN');--> statement-breakpoint
CREATE TYPE "public"."service_status" AS ENUM('ONLINE', 'INFO');--> statement-breakpoint
CREATE TABLE "budget_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"budget_id" integer NOT NULL,
	"group" "budget_group" NOT NULL,
	"name" text NOT NULL,
	"is_total" boolean DEFAULT false NOT NULL,
	"planned" bigint NOT NULL,
	"realized" bigint NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"version" "budget_version" DEFAULT 'MURNI' NOT NULL,
	"as_of" timestamp with time zone NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" "document_category" NOT NULL,
	"year" integer,
	"title" text NOT NULL,
	"description" text,
	"file_url" text NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guestbook_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"origin" text NOT NULL,
	"purpose" text NOT NULL,
	"message" text,
	"ip_hash" text NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "officials" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"position" text NOT NULL,
	"unit" text DEFAULT 'Pemerintah Desa' NOT NULL,
	"photo_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"section" "section" NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"body" text NOT NULL,
	"external_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "population_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"category" text NOT NULL,
	"label" text NOT NULL,
	"male" integer DEFAULT 0 NOT NULL,
	"female" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"as_of" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" "post_category" NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text,
	"body" text NOT NULL,
	"cover_url" text,
	"video_url" text,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"tagline" text NOT NULL,
	"description" text NOT NULL,
	"url" text NOT NULL,
	"icon" text NOT NULL,
	"status" "service_status" DEFAULT 'ONLINE' NOT NULL,
	"bento_span" "bento_span" DEFAULT 'sm' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "services_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "budget_lines" ADD CONSTRAINT "budget_lines_budget_id_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "budget_lines_budget_group_idx" ON "budget_lines" USING btree ("budget_id","group");--> statement-breakpoint
CREATE UNIQUE INDEX "budgets_year_version_uq" ON "budgets" USING btree ("year","version");--> statement-breakpoint
CREATE UNIQUE INDEX "budgets_one_current_uq" ON "budgets" USING btree ("is_current") WHERE "budgets"."is_current" = true;--> statement-breakpoint
CREATE INDEX "documents_cat_year_idx" ON "documents" USING btree ("category","year");--> statement-breakpoint
CREATE INDEX "guestbook_created_idx" ON "guestbook_entries" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "pages_section_slug_uq" ON "pages" USING btree ("section","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "population_year_cat_label_uq" ON "population_stats" USING btree ("year","category","label");--> statement-breakpoint
CREATE INDEX "posts_feed_idx" ON "posts" USING btree ("category","published","published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "posts_fts_idx" ON "posts" USING gin (to_tsvector('simple', "title" || ' ' || "body"));