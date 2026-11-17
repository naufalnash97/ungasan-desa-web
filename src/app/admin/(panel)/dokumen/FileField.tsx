"use client";
import { useFieldError } from "../../_ui/AdminForm";

export default function FileField({ name, label }: { name: string; label: string }) {
  const err = useFieldError(name);
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      <input id={name} name={name} type="file" accept="application/pdf,image/png,image/jpeg,image/webp" aria-invalid={Boolean(err)}
        className="mt-1.5 block w-full rounded-btn border border-dashed border-line bg-white px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-ink file:px-3 file:py-1 file:text-white" />
      {err && <p className="mt-1 text-[12.5px] text-red-700">{err}</p>}
    </div>
  );
}
