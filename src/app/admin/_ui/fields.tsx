"use client";
import { useFieldError, useFormPending } from "./AdminForm";

const base = "mt-1.5 block w-full rounded-btn border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink aria-[invalid=true]:border-red-600";

function Wrap({ name, label, hint, children }: { name: string; label: string; hint?: string; children: React.ReactNode }) {
  const err = useFieldError(name);
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-ink">{label}</label>
      {children}
      {hint && !err && <p className="mt-1 text-[12.5px] text-muted">{hint}</p>}
      {err && <p id={`${name}-err`} className="mt-1 text-[12.5px] text-red-700">{err}</p>}
    </div>
  );
}

type InputProps = { name: string; label: string; hint?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">;
export function TextField({ name, label, hint, ...rest }: InputProps) {
  const err = useFieldError(name);
  return (
    <Wrap name={name} label={label} hint={hint}>
      <input id={name} name={name} className={base} aria-invalid={Boolean(err)} aria-describedby={err ? `${name}-err` : undefined} {...rest} />
    </Wrap>
  );
}

type AreaProps = { name: string; label: string; hint?: string } & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name">;
export function TextArea({ name, label, hint, className, ...rest }: AreaProps) {
  const err = useFieldError(name);
  return (
    <Wrap name={name} label={label} hint={hint}>
      <textarea id={name} name={name} className={`${base} ${className ?? ""}`} aria-invalid={Boolean(err)} {...rest} />
    </Wrap>
  );
}

export function SelectField({ name, label, options, hint, ...rest }: { name: string; label: string; hint?: string; options: { value: string; label: string }[] } & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "name">) {
  return (
    <Wrap name={name} label={label} hint={hint}>
      <select id={name} name={name} className={base} {...rest}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Wrap>
  );
}

export function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-ink" /> {label}
    </label>
  );
}

export function SubmitButton({ children = "Simpan", className = "btn-primary" }: { children?: React.ReactNode; className?: string }) {
  const pending = useFormPending();
  return <button type="submit" className={className} disabled={pending} aria-busy={pending}>{pending ? "Menyimpan…" : children}</button>;
}
