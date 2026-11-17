"use client";
import { useState } from "react";

type Errors = Partial<Record<"name" | "origin" | "purpose" | "message", string[]>>;
const FIELDS = [
  { name: "name", label: "Nama lengkap", required: true, max: 100 },
  { name: "origin", label: "Asal / instansi", required: true, max: 120 },
  { name: "purpose", label: "Keperluan", required: true, max: 200 },
] as const;

export default function GuestbookForm() {
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState("sending"); setErrors({});
    const res = await fetch("/api/v1/buku-tamu", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    }).catch(() => null);
    const json = await res?.json().catch(() => null);
    if (res?.status === 201) { setState("ok"); setMsg("Terima kasih! Kunjungan Anda sudah tercatat."); form.reset(); return; }
    setState("error");
    if (res?.status === 422) { setErrors(json?.error?.details ?? {}); setMsg("Periksa kembali isian yang ditandai."); }
    else setMsg(json?.error?.message ?? "Gagal mengirim. Coba lagi.");
  }

  const input = "mt-1.5 block w-full rounded-btn border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-ink aria-[invalid=true]:border-red-600";
  return (
    <form onSubmit={onSubmit} method="post" noValidate className="max-w-xl space-y-5">
      {FIELDS.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="text-sm font-medium">{f.label} <span aria-hidden className="text-eyebrow">*</span></label>
          <input id={f.name} name={f.name} required maxLength={f.max} className={input}
            aria-invalid={Boolean(errors[f.name])} aria-describedby={errors[f.name] ? `${f.name}-err` : undefined} />
          {errors[f.name] && <p id={`${f.name}-err`} className="mt-1 text-[13px] text-red-700">{errors[f.name]![0]}</p>}
        </div>
      ))}
      <div>
        <label htmlFor="message" className="text-sm font-medium">Pesan <span className="font-normal text-muted">(opsional)</span></label>
        <textarea id="message" name="message" rows={4} maxLength={1000} className={input} />
      </div>
      {/* honeypot — disembunyikan dari manusia */}
      <div aria-hidden className="absolute -left-[9999px]"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <button type="submit" className="btn-primary h-11 px-5" disabled={state === "sending"}>{state === "sending" ? "Mengirim…" : "Kirim"}</button>
      <p role="status" aria-live="polite" className={`text-sm ${state === "ok" ? "text-mint-ink" : "text-red-700"}`}>{msg}</p>
    </form>
  );
}
