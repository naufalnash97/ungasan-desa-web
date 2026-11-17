import "server-only";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? "./uploads");
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20 MB

/** Tipe yang diizinkan, diverifikasi dari isi file (magic bytes) — bukan dari ekstensi/MIME kiriman browser. */
const TYPES = [
  { ext: "pdf", mime: "application/pdf", test: (b: Buffer) => b.subarray(0, 5).toString("latin1") === "%PDF-" },
  { ext: "png", mime: "image/png", test: (b: Buffer) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: "jpg", mime: "image/jpeg", test: (b: Buffer) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: "webp", mime: "image/webp", test: (b: Buffer) => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP" },
] as const;

export const MIME_BY_EXT: Record<string, string> = Object.fromEntries(TYPES.map((t) => [t.ext, t.mime]));

export class UploadError extends Error {}

/** Simpan file unggahan ke UPLOAD_DIR/<tahun>/<acak>-<nama-aman>.<ext>; kembalikan URL publik /uploads/... */
export async function saveUpload(file: File) {
  if (!file || file.size === 0) throw new UploadError("Pilih file terlebih dahulu.");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("Ukuran file maksimal 20 MB.");
  const buf = Buffer.from(await file.arrayBuffer());
  const type = TYPES.find((t) => t.test(buf));
  if (!type) throw new UploadError("Hanya PDF, PNG, JPG, atau WEBP yang diizinkan.");
  const base = path.parse(file.name).name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "dokumen";
  const year = String(new Date().getFullYear());
  const name = `${randomBytes(6).toString("hex")}-${base}.${type.ext}`;
  await mkdir(path.join(UPLOAD_DIR, year), { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, year, name), buf, { flag: "wx" });
  return { url: `/uploads/${year}/${name}`, size: file.size, mime: type.mime };
}

/** Hapus file lokal bila URL menunjuk ke /uploads (abaikan URL eksternal). */
export async function removeUpload(url: string) {
  if (!url.startsWith("/uploads/")) return;
  const target = path.resolve(UPLOAD_DIR, url.slice("/uploads/".length));
  if (!target.startsWith(UPLOAD_DIR + path.sep)) return;
  await unlink(target).catch(() => {});
}
