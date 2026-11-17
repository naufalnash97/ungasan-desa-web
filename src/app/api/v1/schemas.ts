import { z } from "zod";

export const postInput = z.object({
  category: z.enum(["BERITA", "PENGUMUMAN", "VIDEO"]),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug kebab-case").max(120),
  title: z.string().min(3).max(200),
  excerpt: z.string().max(300).optional(),
  body: z.string().min(1).max(50_000),
  coverUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  publishedAt: z.coerce.date().optional(),
  published: z.boolean().optional(),
});

export const budgetInput = z.object({
  year: z.number().int().min(2000).max(2100),
  version: z.enum(["MURNI", "PERUBAHAN", "PERUBAHAN_KEDUA"]),
  asOf: z.coerce.date(),
  isCurrent: z.boolean().default(false),
  lines: z.array(z.object({
    group: z.enum(["PENDAPATAN", "BELANJA", "PEMBIAYAAN"]),
    name: z.string().min(1).max(200),
    isTotal: z.boolean().default(false),
    planned: z.number().int().nonnegative(),
    realized: z.number().int().nonnegative(),
  })).min(1).max(200),
});

export const guestbookInput = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  origin: z.string().trim().min(2, "Asal/instansi wajib diisi").max(120),
  purpose: z.string().trim().min(3, "Keperluan wajib diisi").max(200),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  website: z.string().max(500).optional(), // honeypot — bila terisi, dianggap bot
});
