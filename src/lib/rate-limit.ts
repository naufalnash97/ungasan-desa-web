/**
 * Rate limiter sliding-window in-memory (cukup untuk 1 instance; ganti Redis bila scale-out).
 *
 * Pengaman memori TIDAK boleh mereset kunci yang sedang diblokir — kalau tidak, penyerang bisa
 * membanjiri kunci acak untuk "membersihkan" blokir akun yang sedang ia tebak password-nya.
 * Saat penuh: (1) buang jendela yang sudah kedaluwarsa, (2) buang kunci yang BELUM mencapai limit,
 * mulai dari yang terlama. Kunci yang sedang diblokir selalu dipertahankan.
 */
type Bucket = { hits: number[]; limit: number; windowMs: number };
const buckets = new Map<string, Bucket>();
const MAX_KEYS = 10_000;

function sweep(now: number) {
  for (const [k, b] of buckets) if (!b.hits.some((t) => now - t < b.windowMs)) buckets.delete(k);
  if (buckets.size <= MAX_KEYS) return;
  for (const [k, b] of buckets) {
    if (buckets.size <= MAX_KEYS) break;
    const active = b.hits.filter((t) => now - t < b.windowMs).length;
    if (active < b.limit) buckets.delete(k); // belum diblokir → boleh dibuang
  }
}

/** Cek tanpa mencatat — untuk limit yang hanya menghitung KEGAGALAN (mis. login). */
export function isLimited(key: string) {
  const b = buckets.get(key);
  if (!b) return false;
  const now = Date.now();
  return b.hits.filter((t) => now - t < b.windowMs).length >= b.limit;
}

export function rateLimit(key: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const b = buckets.get(key) ?? { hits: [], limit, windowMs };
  b.hits = b.hits.filter((t) => now - t < windowMs);
  if (b.hits.length >= limit) {
    buckets.set(key, b);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - b.hits[0])) / 1000) };
  }
  b.hits.push(now);
  buckets.set(key, b);
  if (buckets.size > MAX_KEYS) sweep(now);
  return { ok: true, retryAfter: 0 };
}
