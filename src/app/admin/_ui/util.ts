import type { ZodError } from "zod";
import type { ActionState } from "./types";

export const fromZod = (e: ZodError): ActionState => ({ message: "Periksa kembali isian yang ditandai.", fieldErrors: e.flatten().fieldErrors as Record<string, string[]> });
export const checkbox = (fd: FormData, name: string) => fd.get(name) === "on";
export const str = (fd: FormData, name: string) => {
  const v = fd.get(name);
  return typeof v === "string" ? v.trim() : "";
};
import { z } from "zod";
/** URL wajib https:// — z.string().url() saja menerima javascript: dan data: */
export const httpsUrl = z.string().url("URL tidak valid").refine((u) => u.startsWith("https://"), "Gunakan tautan https://");
export const optional = (v: string) => (v === "" ? undefined : v);
export const slugify = (v: string) =>
  v.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
export const violatedConstraint = (e: unknown) => {
  const x = e as { constraint?: string; cause?: { constraint?: string } };
  return x?.constraint ?? x?.cause?.constraint;
};
export const isUniqueViolation = (e: unknown) => (e as { code?: string; cause?: { code?: string } })?.code === "23505" || (e as { cause?: { code?: string } })?.cause?.code === "23505";
