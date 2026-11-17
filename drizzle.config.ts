import { defineConfig } from "drizzle-kit";

// Muat .env otomatis (Node ≥ 20.12) agar `npm run db:migrate` jalan tanpa langkah tambahan di Mac/Linux.
// Di Docker/CI variabel sudah di-set, jadi file .env yang tidak ada diabaikan.
try { process.loadEnvFile(".env"); } catch { /* tidak ada .env */ }

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL belum di-set. Salin .env.example menjadi .env lalu isi.");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL },
  strict: true,
});
