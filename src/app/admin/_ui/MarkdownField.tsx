"use client";
import { useState, useTransition } from "react";
import { useFieldError } from "./AdminForm";
import { previewMarkdown } from "./preview-action";

/** Editor Markdown dengan tab Tulis / Pratinjau. */
export default function MarkdownField({ name, label, defaultValue = "", rows = 14 }: { name: string; label: string; defaultValue?: string; rows?: number }) {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"tulis" | "pratinjau">("tulis");
  const [html, setHtml] = useState("");
  const [pending, start] = useTransition();
  const err = useFieldError(name);
  const showPreview = () => { setTab("pratinjau"); start(async () => setHtml(await previewMarkdown(value))); };
  return (
    <div>
      <div className="flex items-end justify-between">
        <label htmlFor={name} className="text-sm font-medium">{label}</label>
        <div role="tablist" aria-label="Mode editor" className="flex gap-1 text-[12.5px]">
          <button type="button" role="tab" aria-selected={tab === "tulis"} onClick={() => setTab("tulis")} className={`rounded px-2 py-1 ${tab === "tulis" ? "bg-ink text-white" : "hover:bg-tint"}`}>Tulis</button>
          <button type="button" role="tab" aria-selected={tab === "pratinjau"} onClick={showPreview} className={`rounded px-2 py-1 ${tab === "pratinjau" ? "bg-ink text-white" : "hover:bg-tint"}`}>Pratinjau</button>
        </div>
      </div>
      <textarea id={name} name={name} rows={rows} value={value} onChange={(e) => setValue(e.target.value)} hidden={tab !== "tulis"}
        aria-invalid={Boolean(err)} className="mt-1.5 block w-full rounded-btn border border-line bg-white px-3 py-2 font-mono text-[13px] leading-relaxed outline-none focus:border-ink" />
      {tab === "pratinjau" && (
        <div className="prose-desa mt-1.5 min-h-40 rounded-btn border border-line bg-white px-4 py-2" aria-busy={pending}
          dangerouslySetInnerHTML={{ __html: pending ? "<p>Memuat pratinjau…</p>" : html || "<p><em>Kosong</em></p>" }} />
      )}
      <p className="mt-1 text-[12.5px] text-muted">{err ? <span className="text-red-700">{err}</span> : "Format Markdown: ## Judul, **tebal**, - daftar, [tautan](https://…)"}</p>
    </div>
  );
}
