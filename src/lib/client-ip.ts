/**
 * IP klien yang bisa dipercaya untuk rate-limit.
 * Entri x-forwarded-for paling KIRI dikendalikan klien (bisa dipalsukan), jadi kita ambil entri yang
 * ditambahkan oleh reverse proxy kita sendiri: hitung TRUSTED_PROXY_HOPS dari kanan (default 1 = satu nginx/Caddy).
 * Tanpa proxy (TRUSTED_PROXY_HOPS=0) header diabaikan seluruhnya.
 */
export function trustedClientIp(get: (name: string) => string | null | undefined) {
  const hops = Number(process.env.TRUSTED_PROXY_HOPS ?? 1);
  if (hops > 0) {
    const chain = (get("x-forwarded-for") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    if (chain.length >= hops) return chain[chain.length - hops];
    const real = get("x-real-ip");
    if (real) return real.trim();
  }
  return "unknown";
}
