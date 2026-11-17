/** Rate limiter sliding-window in-memory (cukup untuk 1 instance; ganti Redis bila scale-out). */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    hits.set(key, arr);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - arr[0])) / 1000) };
  }
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 10_000) hits.clear(); // pengaman memori
  return { ok: true, retryAfter: 0 };
}
