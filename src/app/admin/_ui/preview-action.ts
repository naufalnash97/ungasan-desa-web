"use server";
import { requireAdmin } from "@/lib/session";
import { renderMarkdown } from "@/lib/markdown";

/** Pratinjau dirender & disanitasi di server — konten editor tidak pernah dieksekusi mentah di browser admin. */
export async function previewMarkdown(md: string) {
  await requireAdmin();
  return renderMarkdown(md.slice(0, 50_000));
}
