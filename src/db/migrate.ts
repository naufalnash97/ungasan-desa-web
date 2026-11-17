/**
 * Menjalankan migrasi database (pengganti `drizzle-kit migrate`, yang gagal diam-diam tanpa pesan).
 * Jalankan: npm run db:migrate
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

try { process.loadEnvFile(".env"); } catch { /* di Docker/CI variabel sudah di-set */ }

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✖ DATABASE_URL belum di-set. Salin .env.example menjadi .env lalu isi.");
  process.exit(1);
}

const target = (() => { try { const u = new URL(url); return `${u.hostname}:${u.port || 5432}/${u.pathname.slice(1)} (user ${u.username})`; } catch { return url; } })();
const port = (() => { try { return new URL(url).port || "5432"; } catch { return "5432"; } })();

/** Terjemahkan error PostgreSQL/jaringan menjadi petunjuk yang bisa langsung dikerjakan. */
function explain(e: { code?: string; message?: string }) {
  const portHint = [
    `  Kemungkinan besar ada PostgreSQL LAIN di Mac Anda yang juga memakai port ${port}`,
    `  (Homebrew / Postgres.app), sehingga aplikasi tersambung ke database yang salah.`,
    `  Cek:   lsof -nP -iTCP:${port} -sTCP:LISTEN`,
    `  Solusi: pindahkan database proyek ke port 5433:`,
    `    1) docker-compose.yml → "5433:5432"`,
    `    2) .env baris 1       → localhost:5433`,
    `    3) docker compose up -d db && npm run db:migrate`,
  ];
  switch (e.code) {
    case "ECONNREFUSED":
      return [`Tidak ada database yang menyala di ${target}.`, "  Jalankan: docker compose up -d db   (pastikan Docker Desktop terbuka)", "  Lalu cek: docker compose ps   → harus (healthy)"];
    case "28P01":
      return [`Password ditolak untuk ${target}.`, ...portHint];
    case "28000":
      return [`User tidak dikenal di ${target}.`, ...portHint];
    case "3D000":
      return [`Database tidak ditemukan di ${target}.`, ...portHint];
    case "57P03":
      return ["Database masih menyala (starting up). Tunggu 10 detik lalu ulangi: npm run db:migrate"];
    case "ETIMEDOUT":
      return [`Koneksi ke ${target} timeout.`, "  Cek Docker Desktop & docker compose ps"];
    default:
      return [`${e.code ?? "ERROR"}: ${e.message ?? String(e)}`];
  }
}

const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 8000 });

async function main() {
  console.log(`→ Menyambung ke ${target} …`);
  const { rows } = await pool.query<{ version: string }>("select version()");
  console.log(`✔ Tersambung: ${rows[0].version.split(" ").slice(0, 2).join(" ")}`);
  console.log("→ Menjalankan migrasi …");
  await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
  const { rows: t } = await pool.query<{ n: number }>("select count(*)::int as n from information_schema.tables where table_schema = 'public'");
  console.log(`✔ Migrasi selesai — ${t[0].n} tabel siap. Lanjut: npm run db:seed`);
}

main()
  .then(() => pool.end())
  .catch(async (e) => {
    console.error("\n✖ Migrasi gagal");
    for (const line of explain(e)) console.error(line);
    await pool.end().catch(() => {});
    process.exit(1);
  });
