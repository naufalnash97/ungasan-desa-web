const idr = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("id-ID");

export const rupiah = (n: number) => idr.format(n);
export const angka = (n: number, digits = 0) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n);
export const ribu = (n: number) => num.format(n);

/** Ringkas: Rp 19,2 M / Rp 789,4 jt */
export function rupiahRingkas(n: number) {
  if (n >= 1e12) return `Rp ${angka(n / 1e12, 1)} T`;
  if (n >= 1e9) return `Rp ${angka(n / 1e9, 1)} M`;
  if (n >= 1e6) return `Rp ${angka(n / 1e6, 1)} jt`;
  return rupiah(n);
}

export const persen = (realized: number, planned: number) => (planned > 0 ? (realized / planned) * 100 : 0);

export const tanggal = (d: Date | string) =>
  new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Makassar" }).format(new Date(d));
